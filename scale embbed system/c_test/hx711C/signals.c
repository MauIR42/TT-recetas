#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include "signals.h"
#include "gpio.h"

void ini_senales(){
	if(signal(SIGINT, manejador) == SIG_ERR ){
		printf("Error en el manejador\n");
		exit(EXIT_FAILURE);
	}
}

void manejador( int sig){
	if( sig == SIGINT){
		printf("Se recibió la señal SIGINT, cerrando las entradas GPIO\n");
		close_all();
	   	exit(0);
	}
}