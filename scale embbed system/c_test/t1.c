#include <errno.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <unistd.h>
#include <string.h>

void check_pin(int pin_number, char * direction);
void reset_hx711();
void power_up();
void power_down();
void set_value(int gpio_number, char * value);
void get_data();
void reset_hx711();
int get_value(int gpio);
int get_bit();
int DT_pin = 5, SCK_pin=6;
int binary_to_int(int* data, int len);
unsigned char get_byte();

int main(){
	printf("agregando DT\n");
	printf("%d", DT_pin);
	check_pin(DT_pin, "in");
	printf("agregando SCK\n");
	check_pin(SCK_pin, "out");
	sleep(1);
	reset_hx711();
	printf("colocando el valor\n");
}

void check_pin(int pin, char * direction){
	printf("El valor : %d", pin);
	char gpio_pin[80];
	char*  gpio_export = "/sys/class/gpio/export";
	char*  gpio_unexport = "/sys/class/gpio/unerport";
	printf("colocando el primer dato");
	sprintf(gpio_pin, "/sys/class/gpio/gpio%d", pin);
	char gpio_direction[80], gpio_value[80];
	strcpy(gpio_direction, gpio_pin);
	strcpy(gpio_value, gpio_pin);
	strcat(gpio_direction, "/direction");
	strcat(gpio_value, "/value");
	char str_pin[80];
	sprintf(str_pin, "%d",pin);
	printf("%sr\n", str_pin);
	int fd;
	printf("revisando si el pin esta exportador\n");
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
	printf("colocando la direcciónr\n");
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

void reset_hx711(){
	power_down();
	power_up();
}


void power_up(){
	unsigned char * test;
	set_value(SCK_pin, "0");
	sleep(0.0001);
	test = get_data();
	//obtener mandar un valor x y mandar la ganancia deseada
}

void power_down(){
	set_value(SCK_pin, "1");
	set_value(SCK_pin, "0");
	sleep(0.0001);
}


void  set_value(int gpio_number, char * value){
	char directory[80];
	sprintf(directory,"/sys/class/gpio/gpio%d/value", gpio_number);
	int fd = open(directory, O_WRONLY);
	if(fd == -1){
		perror("No se pudo abrir el valor del  gpio %d");
		exit(1);
	}
	if(write(fd, value, 1) != 1){
		perror("No se pudo establecer como 1 la salida  gpio %d");
		exit(1);
	}
	close(fd);
}

int get_value(int gpio){
	char value[3], directory[80];
	sprintf(directory,"/sys/class/gpio/gpio%d/value", gpio);
//	printf("\n%s\n",directory);
	int fd = open(directory , O_RDONLY);
	if(fd == -1){
		perror("\nNo se pudo abrir el valor del  gpio\n");
		exit(1);
	}
	if(read(fd, value,3) == -1){
		perror("\nNo se pudo obtener el valor del pin\n");
		exit(1);
	}
//	printf("\n%s ",value);
	close(fd);
	return(atoi(value));
}

void get_data(){
	int value;
	unsigned char byte_array[3]; //represents 24 bit data
	// unsigned char first, second, third;
	printf("\na obtener el valor \n");
	int indx;
	printf("\n");
	while(get_value(DT_pin) != 0)
		continue;
	// for(indx = 23; indx > -1;indx--){
		// bit_array[indx] = get_bit();
		// printf("%d", bit_array[indx]);
//		if(!indx % 8)
//			printf("\n");
	// }
	// printf("\n");
	// value = binary_to_int(bit_array,24);
	// printf("value : %d ", value);
	byte_array[0] = get_byte();
	byte_array[1] = get_byte();
	byte_array[2] = get_byte();
//	int  test[6] = {1,0,0,1,1,0};
//	int test2[6] = {0,1,1,0,0,1};
//	printf("value : %d ", binary_to_int(test,6));
//	printf("value : %d ", binary_to_int(test2,6));
	get_bit();//used for the  gain
	return &byte_array[0];

}

unsigned char get_byte(){
	unsigned char byte= 0x0;
	int indx = 0;
	for(indx = 0; indx<8;indx++){
		byte = byte << 1;
		byte = byte | get_bit(DT_pin);
	}
	return byte
}

int get_bit(){
	set_value(SCK_pin, "1");
    set_value(SCK_pin, "0");
    return get_value(DT_pin);
}

int binary_to_int(int* data,int len){
	int indx = 0;
	int res = 0;
	int power = 1;
	printf("\n");
	for(indx = 0; indx < len; indx++){
		res += data[indx] * power;
		power *= 2;
		//printf("%d ", indx);
		printf("%d", data[indx]);
	}
	printf("\n");
	return res;
}
