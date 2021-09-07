#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include "communication.h"
#include "defs.h"
#include "gpio.h"
// #include "hx711.h"
#include "signals.h"
#include "hilo.h"
#include "lcd.h"

extern int pipefd[2];

extern int pipeLCD[2];

int GPIOS[GPIOS_N] = { DT_pin, SCK_pin, LEFT, ACCEPT, RIGHT, BACK_P, RS, EN, DB4, DB5, DB6, DB7 } ;

int main(){
	pthread_t thread_id;

	pthread_t thread_LCD;

	crearTuberia(pipefd);


	crearTuberia(pipeLCD);

	ini_LCD();

	pthread_create( &thread_id, NULL, funHilo, NULL);

	pthread_create( &thread_LCD, NULL, show_message, NULL);

	ini_senales();


	// printf("agregando DT\n");
	// setup_pin(DT_pin, "in");

	// printf("agregando SCK\n");
	// setup_pin(SCK_pin, "out");
	// SCK_fd = get_file_descriptor(SCK_pin);
	// sleep(1);

	// printf("Reiniciando Hx711\n");
	// reset_hx711();

	// printf("Obteniendo el offset\n");
	// tare_scale();
	int selection;

	for(;EVER;){
		printf("listo\n");
		scanf("%d", &selection);
   		if( selection != 1 && selection != 2 && selection != 3 && selection != 4){
			printf("Aún no está listo el usuario\n");
			continue;
   		}
   		else if( selection == 1){
			send_string(thread_LCD,"Prueba 1\n");
   		}
   		else if( selection == 2){
   			send_string(thread_LCD,"Prueba 2 Mensaje grande\n");
   		}
   		else if( selection == 3){
   			send_string(thread_LCD, "Prueba 3 mensaje muy largo que requiere carrusell");
   		}else{
   			printf("terminando\n");
   			break;
   		}
	}

	// close_all();

	return 0;
}
