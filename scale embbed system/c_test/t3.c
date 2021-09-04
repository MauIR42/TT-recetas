#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

#include <signal.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/types.h>

/* GPIO pins */
void setup_pin(int pin_number, char * direction);
void unexport_pin( int pin);
int get_file_descriptor(int pin);
void set_value(int gpio_number, char * value);
int get_value(int gpio);
void close_all();

/* processing */
int binary_to_int(unsigned char data, int len);
int to_int(unsigned char* data);
int * heap_sort(int * data, int len);
int * heapify(int * data, int len, int c);
int get_averange(int *reads,int len,int to_trim);


/* hx711 */
void power_up();
void reset_hx711();
void tare_scale();
int get_weight(int times);
void power_down();

/* communication */
unsigned char * get_data();
int get_bit();
unsigned char get_byte();
int read_and_format();
int read_averange(int read_count);
void get_reference_unit();

/* C communication */
void ini_senales();
void manejador( int sig);


int reference_unit = 188;
int offset = 0;
int DT_pin = 5, SCK_pin=6;

// FILE *DT_fd;
int SCK_fd;

int main(){

	ini_senales();

	printf("agregando DT\n");
	setup_pin(DT_pin, "in");
	printf("agregando SCK\n");
	setup_pin(SCK_pin, "out");

	SCK_fd = get_file_descriptor(SCK_pin);

	sleep(1);

	printf("Reiniciando Hx711\n");

	reset_hx711();

	printf("Obteniendo el offset\n");

	tare_scale();


	printf("Coloque el objeto a pesar\n");
	sleep(3);
	int indx, weight;
	for(indx = 0; indx < 200; indx++){
		weight =get_weight(5);
		printf("%d\n", weight);
	}
	close_all();
}

/* GPIO PINS */

void setup_pin(int pin, char * direction){
	char gpio_pin[80];
	char*  gpio_export = "/sys/class/gpio/export";
	char*  gpio_unexport = "/sys/class/gpio/unexport";

	sprintf(gpio_pin, "/sys/class/gpio/gpio%d", pin);
	char gpio_direction[80], gpio_value[80];
	strcpy(gpio_direction, gpio_pin);
	strcpy(gpio_value, gpio_pin);
	strcat(gpio_direction, "/direction");
	strcat(gpio_value, "/value");
	char str_pin[80];
	sprintf(str_pin, "%d",pin);
	int fd;

	if(access(gpio_pin, F_OK) != 0)
	{
		fd = open(gpio_export, O_WRONLY);
		if(fd == -1) {
			perror("No se pudo abrir");
			exit(1);
		}
		if(write(fd, str_pin, 2) != 2) {
			perror("No se pudo exportar el pin %d");
			exit(1);
		}
		close(fd);
	}
	fd = open(gpio_direction, O_WRONLY);
	if(fd == -1){
		perror("No se pudo abrir la direccion del  gpio %d");
		exit(1);
	}
	if(write(fd, direction, strlen(direction)) != strlen(direction)){
		perror("No se pudo establecer como 'out' el gpio %d");
		exit(1);
	}
	close(fd);
}

void unexport_pin(int pin){
	char*  gpio_unexport = "/sys/class/gpio/unexport";
	int fd;
	char str_pin[2];
	sprintf(str_pin, "%d",pin);
	fd = open(gpio_unexport, O_WRONLY);
	if(fd == -1) {
		perror("No se pudo abrir");
		exit(1);
	}
	if(write(fd, str_pin, 2) != 2) {
		perror("No se pudo exportar el pin %d");
		exit(1);
	}
	close(fd);

}

int get_file_descriptor(int pin){
	char directory[80];
	int fd;
	sprintf(directory,"/sys/class/gpio/gpio%d/value", pin);
	fd = open(directory, O_WRONLY);
	if(fd == -1){
		perror("No se pudo abrir el valor del  gpio %d");
		exit(1);
	}
	return fd;
}

void  set_value(int gpio_number, char * value){
	char directory[80];
	if(write(SCK_fd, value, 1) != 1){ 
		perror("No se pudo establecer como 1 la salida  gpio %d");
		exit(1);
	}
}

int get_value(int gpio){
	char value[3], directory[80];
	sprintf(directory,"/sys/class/gpio/gpio%d/value", gpio);
	int fd = open(directory , O_RDONLY);
	if(fd == -1){
		perror("\nNo se pudo abrir el valor del  gpio\n");
		exit(1);
	}
	if(read(fd, value,3) == -1){
		perror("\nNo se pudo obtener el valor del pin\n");
		exit(1);
	}
	close(fd);

	return(atoi(value));

}

void close_all(){
	unexport_pin(DT_pin);
	unexport_pin(SCK_pin);
	close(SCK_fd);
}

/* processing */

int binary_to_int(unsigned char data,int len){
	unsigned char test= 0x1;
	int indx = 0;
	int res = 0;
	int power = 1;
	for(indx = 0; indx < len; indx++){
		if(data & test)
			res <<= 1;
		else
			res <<= 0;
		test <<= 0;
	}
	printf("%d\n", data);
	return res;
}

int to_int(unsigned char * binary){

	return (int)(( (binary[0] << 16)| (binary[1] << 8) | (binary[2])) & 0x7fffff)- 
			(( (binary[0] << 16)| (binary[1] << 8) | (binary[2])) & 0x800000);
}

int * heap_sort(int * data, int len){
	int start = len/2 - 1, indx;
	int temp;
	for(indx = start; indx >= 0; indx --){
		data = heapify(data,len, indx);
	}
	for(indx = len -1; indx >= 0; indx--){
		temp = data[indx];
		data[indx] = data [0];
		data[0] = temp;
		data = heapify(data,indx, 0);
	}
	return &data[0];
}

int * heapify(int * data, int len, int c){
	int largest = c, l = c * 2 + 1, r = c * 2 + 2;
	int temp;
	if( l <= (len - 1) && data[largest] < data[l])
		largest = l;
	if( r <= (len - 1) && data[largest] < data[r] )
		largest = r;
	if(largest != c){
		temp = data[c];
		data[c] = data[largest];
		data[largest] = temp;
		return heapify(data, len, largest);
	}
	return data;
}

int get_averange(int *reads,int len,int to_trim){
	int total = 0, indx;
	for(indx = to_trim; indx < (len - to_trim); indx++)
		total += reads[indx];
	return total / (len - (to_trim * 2));
}

/* hx711 */

void power_up(){
	set_value(SCK_pin, "0");
	sleep(0.0001);
	get_data(); //maybe it doesn't have to be here

}

void reset_hx711(){
	power_down();
	power_up();
}

void tare_scale(){
	int value = read_averange(15);
	offset = value;
}

int get_weight(int times){
	int value = read_averange(times) - offset;
	return value = value / reference_unit;

}

void power_down(){
	set_value(SCK_pin, "0");
	set_value(SCK_pin, "1");
	sleep(0.0001);
}

/* communication */

int read_averange(int read_count){
	int indx;
	int *reads = (int *) calloc(read_count, sizeof(int));
	int to_trim;
	to_trim = (int) ((float)read_count * 0.2);
	for(indx = 0; indx < read_count; indx++)
		reads[indx] = read_and_format();
	reads = heap_sort(&reads[0], read_count);
	return get_averange(reads,read_count,to_trim);

}

int read_and_format(){
	int data_compressed;
	unsigned char * byte_data = get_data();
	data_compressed = to_int(byte_data);
	return data_compressed;
}

unsigned char * get_data(){
	int value;
	static unsigned char byte_array[3]; //represents 24 bit data
	while(get_value(DT_pin) != 0)
		continue;
	byte_array[0] = get_byte(); //MSB and 7 bits
	byte_array[1] = get_byte();
	byte_array[2] = get_byte(); //7 bits and LSB
	get_bit();//used for the  gain
	return byte_array;
}

unsigned char get_byte(){
	unsigned char byte = 0x0;
	int indx = 0;
	for(indx = 0; indx<8;indx++){
		byte = byte << 1;
		byte = byte | get_bit(DT_pin);
	}
	return byte;
}

int get_bit(){
	int value;
	set_value(SCK_pin, "1");
    set_value(SCK_pin, "0");
    return get_value(DT_pin);
}

void get_reference_unit(){
	int value = get_weight(20);
	reference_unit = value;

}

/* C communication */

void ini_senales(){
	if(signal(SIGINT, manejador) == SIG_ERR ){
		printf("Error en el manejador\n");
		exit(EXIT_FAILURE);
	}
	else{
		printf("Sin errores\n");
	}
}

void manejador( int sig){
	if( sig == SIGINT){
		printf("Se recibió la señal SIGINT, cerrando las entradas GPIO\n");
		close_all();
	   	exit(0);
	}
}

