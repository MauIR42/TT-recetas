#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include "defs.h"
#include "menu.h"
#include "gpio.h"
#include "food_list.h"

enum ButtonStates { UP, DOWN, PRESS, RELEASE };
enum ButtonStates delay_debounce(enum ButtonStates button_state, int button);

struct node *weight;
struct node *offset;
struct node *finish;
struct node *current;

extern struct list_element *head;
struct list_element *current_element;

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

void create_menus(){
	create_main_menu();
	create_food_list();

	current_element = head;
	current = weight;
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