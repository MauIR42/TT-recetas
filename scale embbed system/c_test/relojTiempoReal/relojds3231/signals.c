
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <signal.h>
#include <sys/types.h>

#include "defs.h"
#include "signals.h"

extern int pipefd[2];
extern struct datos datosHilo;


void manejador( int sig){
	if( sig == SIGINT){
		printf("Se recibió la señal SIGINT, concluyendo con el socket\n");
	   	exit(0);
	}
	else if( sig == SIGUSR1){
		printf("Se recibió la señal para enviar los datos al cliente\n");
		write(pipefd[1],&datosHilo,sizeof(struct datos));
	}
}

void ini_signals(){

	if(signal(SIGINT, manejador) == SIG_ERR ){
		printf("Error en el manejador");
		exit(EXIT_FAILURE);
	}

	if(signal(SIGUSR1, manejador) == SIG_ERR){
		printf("Error en el manejador");
		exit(EXIT_FAILURE);
	}
}