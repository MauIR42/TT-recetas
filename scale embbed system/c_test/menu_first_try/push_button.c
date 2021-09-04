#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include "defs.h"
#include "gpio.h"
#include "food_list.h"

void main_menu();
void scale_menu();
void create_main_menu();

enum ButtonStates { UP, DOWN, PRESS, RELEASE };
enum ButtonStates delay_debounce(enum ButtonStates button_state, int button);

struct node *weight;
struct node *offset;
struct node *finish;
struct node *current;

extern struct list_element *head;
struct list_element *current_element;


int main(){

	create_main_menu();

	current = weight;

	printf("Iniciando lectura de datos\n");

	printf("agregando LEFT\n");
	setup_pin(LEFT, "in");

	printf("agregando RIGHT\n");
	setup_pin(RIGHT, "in");

	printf("agregando ACCEPT\n");
	setup_pin(ACCEPT, "in");

	// attempt_one();
	create_food_list();

	current_element = head;

	main_menu();

	printf("Terminando ejemplo\n");
	close_all();
}

void create_main_menu(){
	weight = (struct node *) malloc(sizeof(struct node));
	weight->option = 1;
	weight->name = "Pesar";

	offset = (struct node *) malloc(sizeof(struct node));
	offset->option = 2;
	offset->name = "Marcar 0";

	finish = (struct node *) malloc(sizeof(struct node));
	finish->option = 3;
	finish->name = "apagar";

	weight->previous = finish;
	weight->next = offset;

	offset->previous = weight;
	offset->next = finish;

	finish->previous = offset;
	finish->next = weight;
}

void main_menu(){
	int c_l = 0, c_r = 0, c_a = 0;
	int p_l = 0, p_r = 0, p_a = 0;

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
			printf("ACCEPT\n");
			if(current->option == 1){
				scale_menu();
			}
			else if(current->option == 2)
				printf("Calcular offset!\n");
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
}

void scale_menu(){
	printf("Obteniendo lista...\n");
	sleep(1);
	int c_l = 0, c_r = 0, c_a = 0;
	int p_l = 0, p_r = 0, p_a = 0;

	printf("current = %s\n", current_element->name);
	for(;EVER;){
		c_l = get_value(LEFT);
		c_r = get_value(RIGHT);
		c_a = get_value(ACCEPT);
		
		sleep(0.009);

		c_l = c_l & get_value(LEFT);
		c_r = c_r & get_value(RIGHT);
		c_a = c_a & get_value(ACCEPT);

		if(p_l != c_l && c_l){
			current_element = current_element -> previous;
			printf("Seleccionado : %s\n", current_element -> name);
		}
		if(p_r != c_r && c_r){
			printf("RIGHT\n");
			current_element = current_element -> next;
			printf("Seleccionado : %s\n", current_element -> name);
		}
		if(p_a != c_a && c_a){
			printf("Entendido, se va a pesar el siguiente elemento : %s\n", current_element -> name);
			break;
		}
		p_l = c_l;
		p_r = c_r;
		p_a = c_a;
	}
}