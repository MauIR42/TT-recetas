#include <pthread.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <signal.h>

#include "defs.h"
#include "comunicacion.h"

int pipefd[2];

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
