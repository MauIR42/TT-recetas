#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include "communication.h"
#include "defs.h"
#include "gpio.h"
#include "hx711.h"
#include "signals.h"
#include "hilo.h"

int  SCK_fd;

extern int pipefd[2];

int main(){
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);

	ini_senales();

	printf("agregando DT\n");
	setup_pin(DT_pin, "in");

	printf("agregando SCK\n");
	setup_pin(SCK_pin, "out");
	SCK_fd = get_file_descriptor(SCK_pin);
	sleep(1);

	printf("Reiniciando Hx711\n");
	reset_hx711();

	printf("Obteniendo el offset\n");
	tare_scale();

	printf("Coloque el objeto a pesar\n");
	sleep(3);
	int weight, selection;

	for(;EVER;){
		printf("Seleccione lo que desea hacer\n");
		printf("Pesar (1)\n");
		printf("Recalcular 0 (2) \n");
		printf("Apagar (3) \n");
		scanf("%d", &selection);
   		if( selection != 1 && selection != 2 && selection != 3){
			printf("Aún no está listo el usuario\n");
			continue;
   		}
   		else if( selection == 1){
   			weight =get_weight(20);
			printf("%d\n", weight);
			obtener_info(thread_id);
   		}
   		else if( selection == 2)
   			tare_scale();
   		else{
   			printf("Terminando programa\n");
   			break;
   		}
	}

	close_all();

	return 0;
}