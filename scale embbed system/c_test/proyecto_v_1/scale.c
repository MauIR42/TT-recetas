#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include "communication.h"
#include "defs.h"
#include "gpio.h"
#include "hx711.h"
#include "signals.h"
#include "hilo.h"
#include "menu.h"
#include "food_list.h"
#include "http.h"
// #include "defs.h"
int  SCK_fd;

//RTCC
extern int pipefd[2];

//Menu
extern struct node *current;
extern struct list_element *current_element;


void start_menu(pthread_t thread_id);

int main(){

	/* Menu section*/

	create_menus();

	printf("agregando LEFT\n");
	setup_pin(LEFT, "in");

	printf("agregando RIGHT\n");
	setup_pin(RIGHT, "in");

	printf("agregando ACCEPT\n");
	setup_pin(ACCEPT, "in");
	/* RTCC section*/
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);

	/*scale section*/
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

	// for(;EVER;){
	// 	printf("Seleccione lo que desea hacer\n");
	// 	printf("Pesar (1)\n");
	// 	printf("Recalcular 0 (2) \n");
	// 	printf("Apagar (3) \n");
	// 	scanf("%d", &selection);
 //   		if( selection != 1 && selection != 2 && selection != 3){
	// 		printf("Aún no está listo el usuario\n");
	// 		continue;
 //   		}
 //   		else if( selection == 1){
 //   			weight =get_weight(20);
	// 		printf("%d\n", weight);
	// 		obtener_info(thread_id);
 //   		}
 //   		else if( selection == 2)
 //   			tare_scale();
 //   		else{
 //   			printf("Terminando programa\n");
 //   			break;
 //   		}
	// }
	start_menu(thread_id);
	return 0;
}

void start_menu(pthread_t thread_id){
	int weight;
	struct datos *test;
	int c_l = 0, c_r = 0, c_a = 0;
	int p_l = 0, p_r = 0, p_a = 0;

	/* http section */
	char * ip;
	// char * hostName;
	// ip = hostname_to_ip(hostName);
	ip = "192.168.100.41";
	int puerto = 8000;
	char *petition_complete;
	int sockfd;

	printf("current = %s\n", current->name);
	for(;EVER;){
		c_l = get_value(LEFT);
		c_r = get_value(RIGHT);
		c_a = get_value(ACCEPT);
		
		sleep(0.009);

		c_l = c_l & get_value(LEFT);
		c_r = c_r & get_value(RIGHT);
		c_a = c_a & get_value(ACCEPT);

		if(p_l != c_l && c_l){
			current = current -> previous;
			printf("%s\n",current->name );
		}
		if(p_r != c_r && c_r){
			current = current -> next;
			printf("%s\n",current->name );
		}
		if(p_a != c_a && c_a){
			printf("Seleccionado: %s\n", current->name);
			if(current->option == 1){
				scale_menu();
				weight =get_weight(20);
				test = obtener_info(thread_id);
				printf("La hora es : %x:%x:%x\n", test->horas,test->minutos,test->segundos );
				printf("La fecha es : %x/%x/%x\n", test->dia,test->mes,test->anio);
				// printf("La temperatura es : %d\n", (int)test->temperatura);
				printf("%d\n", weight);
				petition_complete = struct_to_http_method("POST", "/scale/user_weight/", test, weight );
				sockfd = connect_to_server(ip, puerto);
				send_petition(sockfd, petition_complete);
				printf("Información enviada.\n");
				close(sockfd);
					// petition_complete = struct_to_http_method("GET", "/scale/user_weight/", prueba, weight );
			}
			else if(current->option == 2){
				printf("Calcular offset!\n");
				tare_scale();
			}
			else{
				printf("terminando ejecución!\n");
				break;
			}
			// sleep(0.001);
		}
		p_l = c_l;
		p_r = c_r;
		p_a = c_a;
		// sleep(0.001);
	}

	close_all();
}