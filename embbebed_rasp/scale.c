#define _XOPEN_SOURCE 500
#include <stdio.h>
#include <unistd.h>
#include <pthread.h>
#include <termios.h>
#include <stdlib.h>
#include <string.h>
#include <ftw.h>

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
#include "user.h"
//RTCC
extern int pipefd[2];

//GPIO
int GPIOS[GPIOS_N] = { DT_pin, SCK_pin, LEFT, ACCEPT, RIGHT, BACK_P, RS, EN, DB4, DB5, DB6, DB7 } ;


//Menu


void start_menu(pthread_t thread_id);
struct node * restart_menu(struct node * head);

// user
int user_id;
char * current_user;
int has_users = 1;

//scale info
char * access_code;

int main(){

	/* LCD section*/

	ini_LCD();

	/*user*/
	current_user = get_first("last.txt");
	user_id = get_user_id(current_user);
	access_code = get_first("scale.txt");
	printf("res:%d\n", strcmp(current_user,""));
	if(strcmp(current_user,"") != 0){
		printf("Ultimo usuario: %s\n", current_user);
		writeWord("Bienvenido");
		change_display_line(1);
		writeWord(current_user);
	}else{
		clear_display();
		writeWord("Sin Usuarios");
		has_users = 0;
	}

	/* RTCC section*/
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);

	/*scale section*/
	ini_senales();

	printf("agregando DT\n");
	// setup_pin(DT_pin, "in");

	printf("agregando SCK\n");
	// setup_pin(SCK_pin, "out");
	sleep(1);

	printf("Reiniciando Hx711\n");
	// reset_hx711();

	printf("Obteniendo el offset\n");
	// tare_scale();

	printf("Mostrando menu: \n");

	start_menu(thread_id);
	return 0;
}

void start_menu(pthread_t thread_id){
	struct node * menu = NULL;
	struct node * head = NULL;
	/* Menu section*/

	head = create_menu(1);
	menu = head;

	enum ButtonStates b_l= DOWN, b_r=DOWN, b_a=DOWN, b_b=DOWN;

	int weight;
	// struct datos *test;
	struct datos test2;
	struct datos *test = test;

	test2.segundos = 0x1;
	test2.minutos = 0x1;
	test2.horas = 0x1;
	test2.dia = 0x1;
	test2.mes = 0x1;
	test2.anio = 0x1;
	test2.temperatura = 0x1;
	weight = 180;

	printf("current = %s\n", menu->name);
	clear_display();
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
			printf("tipo:%d", menu->type);
			if(menu->type == 0){
				clear_display();
				if(menu->son != NULL){
					writeWord( menu->name );
					writeWord(": ");
					menu = menu -> son;
					change_display_line(1);
					writeWord( menu->name );
					printf("name: %s\n", menu -> name);
				}else{
					writeWord("No hay usuarios");
					sleep(3);
					clear_display();
					writeWord("Visite la pagina");
					change_display_line(1);
					writeWord("Recettatio.com");
					sleep(3);
					clear_display();
					writeWord("Para saber como");
					change_display_line(1);
					writeWord("Agregar usuarios");
					sleep(3);
					clear_display();
					writeWord("Elija una opcion");
					change_display_line(1);
					writeWord( menu->name );
				}
			}
			else if(menu->type == 1){
				clear_display();
				printf("Pesando!\n");
				writeWord("Pesando: ");
				change_display_line(1);
				writeWord(menu -> name);
				sleep(5);
				// weight =get_weight(20);
				// test = obtener_info(thread_id);
				// printf("La hora es : %x:%x:%x\n", test->horas,test->minutos,test->segundos );
				// printf("La fecha es : %x/%x/%x\n", test->dia,test->mes,test->anio);
				// printf("%d\n", weight);
				send_post(test, weight, menu->id, menu->name );
				// free(test);
				sleep(2);
				menu = NULL;
				free_menu(head);
				head = create_menu(0);
				menu = restart_menu(head);

			}
			else if(menu->type == 2){
				clear_display();
				printf("Calcular offset!\n");
				writeWord("Calculando \ntara...");
				// tare_scale();
				sleep(3);
				menu = restart_menu(head);
			}
			else if(menu->type == 3){
				clear_display();
				writeWord("Sección WIFI");
				change_display_line(1);
				writeWord("Conecte a la pc");
				sleep(3);
				// ini_uart();
				menu = restart_menu(head);
			}
			else if(menu->type == 4){
				clear_display();
				writeWord("Cambiando\nusuario...");
				printf("user_id: %d", menu->id);
				set_last(menu->name);
				sleep(2);
				free(current_user);
				current_user = strdup(menu->name);
				user_id = menu->id;
				menu = NULL;
				free_menu(head);
				head = create_menu(0);
				menu = restart_menu(head);

			}
			else if(menu->type == 5){
				clear_display();
				writeWord("Actualizando...");
				change_display_line(1);
				writeWord("Espere por favor");
				send_get();
				sleep(2);
				current_user = get_until_delimiter("users.txt",',');
				user_id = get_user_id(current_user);
				set_last(current_user);
				if(strcmp(current_user,"") != 0){
					printf("Ultimo usuario: %s\n", current_user);
					clear_display();
					writeWord("Bienvenido");
					change_display_line(1);
					writeWord(current_user);
					sleep(2);
				}else{
					clear_display();
					writeWord("Sin Usuarios");
					sleep(2);
					has_users = 0;
				}
				menu = NULL;
				free_menu(head);
				head = create_menu(0);
				menu = restart_menu(head);

			}else if(menu->type == 6){
				clear_display();
				writeWord("Reiniciando...");
				change_display_line(1);
				writeWord("Espere por favor");


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
			if(menu->father != NULL){
				clear_display();
				menu = menu -> father;
				printf("name: %s\n", menu -> name);
				if( menu-> father == NULL)
					writeWord("Elija una opcion");
				else{
					writeWord( menu->father->name );
					writeWord(": ");
				}
				change_display_line(1);
				writeWord(menu -> name);
			}
		}

	}
	free_menu(head);
	close_all();
}

struct node * restart_menu(struct node * head){
	clear_display();
	writeWord("elija una opcion");
	change_display_line(1);
	writeWord( head->name );
	return head;
}