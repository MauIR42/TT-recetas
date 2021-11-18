
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include "defs.h"
#include "gpio.h"

// extern int  SCK_fd;

extern int GPIOS[GPIOS_N];

void setup_pin(int pin, char * direction){
	// printf("%d : %s\n", pin, direction);
	char gpio_pin[80];
	char*  gpio_export = "/sys/class/gpio/export";
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
			// perror("No se pudo abrir");
			exit(1);
		}
		if(write(fd, str_pin, 2) != 2) {
			// perror("No se pudo exportar el pin %d");
			exit(1);
		}
		close(fd);
	}
	fd = open(gpio_direction, O_WRONLY);
	if(fd == -1){
		// perror("No se pudo abrir la direccion del  gpio %d");
		exit(1);
	}
	if(write(fd, direction, strlen(direction)) != strlen(direction)){
		// perror("No se pudo establecer como 'out' el gpio %d");
		exit(1);
	}
	sleep(0.1);
	close(fd);
}

void unexport_pin(int pin){
	char*  gpio_unexport = "/sys/class/gpio/unexport";
	int fd;
	char str_pin[2];
	sprintf(str_pin, "%d",pin);
	fd = open(gpio_unexport, O_WRONLY);
	if(fd == -1) {
		// perror("No se pudo abrir");
		exit(1);
	}
	if(write(fd, str_pin, 2) != 2) {
		// perror("No se pudo exportar el pin %d");
		exit(1);
	}
	sleep(0.1);
	close(fd);

}

int get_file_descriptor(int pin){
	char directory[80];
	int fd;
	sprintf(directory,"/sys/class/gpio/gpio%d/value", pin);
	fd = open(directory, O_WRONLY);
	if(fd == -1){
		// perror("No se pudo abrir el valor del  gpio %d");
		exit(1);
	}
	return fd;
}

void  set_value(int gpio_number, char * value){
	char directory[80];
	sprintf(directory,"/sys/class/gpio/gpio%d/value", gpio_number);
	int fd = open(directory, O_WRONLY);
	if(fd == -1){
		// perror("No se pudo abrir el valor del  gpio %d");
		exit(1);
	}
	if(write(fd, value, 1) != 1){ 
		// printf("gpio: %d\n", gpio_number);
		// perror("No se pudo establecer como 1 la salida  gpio %d");
		exit(1);
	}
	close(fd);
}

int get_value(int gpio){
	char value[3], directory[80];
	sprintf(directory,"/sys/class/gpio/gpio%d/value", gpio);
	int fd = open(directory , O_RDONLY);
	if(fd == -1){
		// printf("%d\n", gpio);
		// perror("\nNo se pudo abrir el valor del  gpio\n");
		exit(1);
	}
	if(read(fd, value,3) == -1){
		// perror("\nNo se pudo obtener el valor del pin\n");
		exit(1);
	}
	close(fd);

	return(atoi(value));

}

void close_all(){
	int i;
	for(i=0; i < GPIOS_N; i++){
		unexport_pin(GPIOS[i]);
	}
	// close(SCK_fd);
}