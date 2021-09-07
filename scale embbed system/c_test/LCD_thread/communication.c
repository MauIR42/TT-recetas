#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <pthread.h>

#include "defs.h"
#include "communication.h"
#include "processing.h"
#include "gpio.h"

int pipefd[2];
int pipeLCD[2];

//hx711


//rtcc

void obtener_info(pthread_t thread_id){
	pthread_kill(thread_id, SIGUSR1);
	struct datos a_cliente;
	read(pipefd[0],&a_cliente, sizeof(struct datos));
   	printf("Obteniendo información del cliente : \n");

   	printf("La hora es : %x:%x:%x\n", a_cliente.horas,a_cliente.minutos,a_cliente.segundos );
	printf("La fecha es : %x/%x/%x\n", a_cliente.dia,a_cliente.mes,a_cliente.anio);
	printf("La temperatura es : %d\n", (int)a_cliente.temperatura);
}

void crearTuberia(int pipefd[]){
	int edo_pipe;
	edo_pipe = pipe( pipefd );
	if( edo_pipe == -1){
		printf("Error al crear la tubería\n");
		exit(EXIT_FAILURE);
	}
}

void send_string(pthread_t thread_id, char text[]){
	write(pipeLCD[1],&text, sizeof(char *));
	pthread_kill(thread_id, SIGUSR2);
}

// void get_reference_unit(){
// 	int value = get_weight(20);
// 	reference_unit = value;

// }
