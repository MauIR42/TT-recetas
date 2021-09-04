
#include <pthread.h>
#include <stdio.h>
#include "defs.h"
#include "signals.h"
#include "comunicacion.h"
#include "hilo.h"

extern int pipefd[2];

void ini_bascula(pthread_t thread_id);

int main()
{
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);

	ini_signals();

	ini_bascula(thread_id);
	
	return 0;
}

void ini_bascula(pthread_t thread_id){
	int decision = 0;
	for(;EVER;)
	{
	   	printf("En espera, presione 1 cuando desee saber la hora...\n");
	   	scanf("%d", &decision);
   		if( decision != 1 ){
			printf("Aún no está listo el usuario\n");
			continue;
   		}
   		printf("Listo para enviar los datos\n");
		obtener_info(thread_id);
	}

}