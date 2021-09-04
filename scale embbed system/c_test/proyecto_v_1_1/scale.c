#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include <termios.h>
#include <stdlib.h>

#include "communication.h"
#include "defs.h"
#include "gpio.h"
#include "hx711.h" //bascula
#include "signals.h"
#include "hilo.h" //rtcc
#include "menu.h" //botones
#include "http.h"
#include "lcd.h"
#include "uart.h"
//RTCC
extern int pipefd[2];

//GPIO
int GPIOS[GPIOS_N] = { DT_pin, SCK_pin, LEFT, ACCEPT, RIGHT, BACK_P, RS, EN, DB4, DB5, DB6, DB7 } ;


//Menu
struct node * menu;
struct node * head;

void start_menu(pthread_t thread_id);
void restart_menu();

int main(){

	/* LCD section*/

	ini_LCD();

	/* Menu section*/

	head = create_menu();
	menu = head;

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
	sleep(1);

	printf("Reiniciando Hx711\n");
	reset_hx711();

	printf("Obteniendo el offset\n");
	tare_scale();

	printf("Mostrando menu: \n");

	start_menu(thread_id);
	return 0;
}

void start_menu(pthread_t thread_id){

	enum ButtonStates b_l= DOWN, b_r=DOWN, b_a=DOWN, b_b=DOWN;

	int weight;
	struct datos *test;

	char * ip;
	ip = "192.168.100.41";
	int puerto = 8000;
	char *petition_complete;
	int sockfd;

	printf("current = %s\n", menu->name);
	writeWord("elija una opcion");
	change_display_line(1);
	writeWord( menu->name );

	for(;EVER;){
		b_l = delay_debounce(b_l, LEFT);
		b_r = delay_debounce(b_r, RIGHT);
		b_a = delay_debounce(b_a, ACCEPT);
		b_b = delay_debounce(b_b, BACK_P);
		if(b_l == PRESS){
			clear_display_line(1);
			change_display_line(1);
			menu = menu -> previous;
			b_l = DOWN;
			printf("name: %s\n", menu -> name);
			writeWord( menu->name );
		}
		if(b_r == PRESS){
			clear_display_line(1);
			change_display_line(1);
			menu = menu -> next;
			b_r = DOWN;
			printf("name: %s\n", menu -> name);
			writeWord( menu->name );
		}
		if(b_a == PRESS){
			b_a = DOWN;
			if(menu->type == 0 && menu->son != NULL){
				clear_display();
				writeWord( menu->name );
				writeWord(": ");
				menu = menu -> son;
				change_display_line(1);
				writeWord( menu->name );
				printf("name: %s\n", menu -> name);
			}
			else if(menu->type == 1){
				clear_display();
				printf("Pesando!\n");
				writeWord("Pesando: ");
				change_display_line(1);
				writeWord(menu -> name);
				weight =get_weight(20);
				test = obtener_info(thread_id);
				printf("La hora es : %x:%x:%x\n", test->horas,test->minutos,test->segundos );
				printf("La fecha es : %x/%x/%x\n", test->dia,test->mes,test->anio);
				printf("%d\n", weight);
				petition_complete = struct_to_http_method("POST", "/scale/user_weight/", test, weight, menu->id );
				sockfd = connect_to_server(ip, puerto);
				send_petition(sockfd, petition_complete);
				printf("Información enviada.\n");
				close(sockfd);
				free(test);
				sleep(1);
				
				restart_menu();

			}
			else if(menu->type == 2){
				clear_display();
				printf("Calcular offset!\n");
				writeWord("Calculando \noffset...");
				tare_scale();

				restart_menu();
			}
			else if(menu->type == 3){
				clear_display();
				writeWord("Confi bascula");
				change_display_line(1);
				writeWord("Conecte a la pc");
				ini_uart();
			}
			else{
				clear_display();
				printf("terminando ejecución!\n");
				writeWord("A dormir...");
				break;
			}
		}

		if(b_b == PRESS){
			b_b = DOWN;
			if(menu->father != NULL)
				menu = menu -> father;
			printf("BACK\n");
			printf("name: %s\n", menu -> name);
			clear_display();
			change_display_line(1);
			writeWord(menu -> name);
		}

	}
	free_menu(head);
	close_all();
}

void restart_menu(){
	menu = head;
	clear_display();
	writeWord("elija una opcion");
	change_display_line(1);
	writeWord( menu->name );
}