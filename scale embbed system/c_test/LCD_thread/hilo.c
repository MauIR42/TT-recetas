
#include <wiringPi.h>
#include <wiringPiI2C.h>
#include <pthread.h>
#include <unistd.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

#include "defs.h"
#include "hilo.h"
#include "lcd.h"


struct datos datosHilo;

char * message ="Iniciando..";
char previous_message[100];

// int new_message = 1;

void * funHilo( void * arg){
	for(;EVER;){
		sleep(200000);
		printf("calculando tiempo\n");

	}
	exit( 0 );
}

void * show_message( void * arg){
	for(;EVER;){
		if(strcmp(message, previous_message) != 0){
			printf("nueva cadena: %s", message);
			clear_display();
			writeWord(message);
			show_carrusell();
			sleep(10);
		}
	}
	exit( 0 );
}