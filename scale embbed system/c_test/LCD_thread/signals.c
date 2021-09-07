#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <string.h>

#include "defs.h"
#include "signals.h"
#include "gpio.h"

extern int pipefd[2];
extern int pipeLCD[2];
extern struct datos datosHilo;

extern char * message;
extern char previous_message[100];

void ini_senales(){
	if(signal(SIGINT, manejador) == SIG_ERR ){
		printf("Error en el manejador\n");
		exit(EXIT_FAILURE);
	}

	else if(signal(SIGUSR1, manejador) == SIG_ERR){
		printf("Error en el manejador");
		exit(EXIT_FAILURE);
	}

	else if(signal(SIGUSR2, manejador) == SIG_ERR){
		printf("Error en el manejador 2");
		exit(EXIT_FAILURE);
	}
}

void manejador( int sig){
	if( sig == SIGINT){
		printf("Se recibió la señal SIGINT, cerrando las entradas GPIO\n");
		// close_all();
	   	exit(0);
	}
	else if( sig == SIGUSR1){
		printf("Se recibió la señal para enviar los datos al cliente\n");
		write(pipefd[1],&datosHilo,sizeof(struct datos));
	}

	else if( sig == SIGUSR2){
		strcpy(previous_message,message);
		// strcpy(str2, str1);
		read(pipeLCD[0],&message,sizeof(char *));
		
	}

}