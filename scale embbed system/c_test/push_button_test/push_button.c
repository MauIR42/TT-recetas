#include <stdio.h>
#include <unistd.h>
#include "defs.h"
#include "gpio.h"



int main(){
	printf("Iniciando lectura de datos\n");

	printf("agregando LEFT\n");
	setup_pin(LEFT, "in");

	printf("agregando RIGHT\n");
	setup_pin(RIGHT, "in");

	printf("agregando ACCEPT\n");
	setup_pin(ACCEPT, "in");
	for(;EVER;){
		if(get_value(LEFT))
			printf("LEFT\n");
		if(get_value(RIGHT))
			printf("RIGHT\n");
		if(get_value(ACCEPT)){
			printf("ACCEPT\n");
			break;
		}
		sleep(0.8);
	}
	printf("Terminando ejemplo\n");
	close_all();
}