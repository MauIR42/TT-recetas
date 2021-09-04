#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include "defs.h"
#include "gpio.h"


void attempt_one();

void attempt_two();

void attempt_three();

enum ButtonStates { UP, DOWN, PRESS, RELEASE };
enum ButtonStates delay_debounce(enum ButtonStates button_state, int button);

struct node *weight;
struct node *offset;
struct node *finish;
struct node *current;

int main(){

	weight = (struct node *) malloc(sizeof(struct node));
	weight->option = 1;

	offset = (struct node *) malloc(sizeof(struct node));
	offset->option = 2;

	finish = (struct node *) malloc(sizeof(struct node));
	finish->option = 3;

	weight->previous = finish;
	weight->next = offset;

	offset->previous = weight;
	offset->next = finish;

	finish->previous = offset;
	finish->next = weight;

	current = weight;

	printf("Iniciando lectura de datos\n");

	printf("agregando LEFT\n");
	setup_pin(LEFT, "in");

	printf("agregando RIGHT\n");
	setup_pin(RIGHT, "in");

	printf("agregando ACCEPT\n");
	setup_pin(ACCEPT, "in");

	// attempt_one();

	// attempt_two();

	attempt_three();

	printf("Terminando ejemplo\n");
	close_all();
}

void attempt_one(){
	int c_l = 0, c_r = 0, c_a = 0;
	int p_l = 0, p_r = 0, p_a = 0;

	printf("current = %d\n", current->option);
	for(;EVER;){
		c_r = get_value(RIGHT);
		c_a = get_value(ACCEPT);
		c_l = get_value(LEFT);
		if(c_l != p_l && c_l){
		// if(c_l){
			printf("LEFT\n");
			current = current -> previous;
		}
		if(c_r != p_r && c_r){
		// if(c_r){
			printf("RIGHT\n");
			current = current -> next;
		}
		if(c_a != p_a && c_a){
		// if(c_a){
			printf("ACCEPT\n");
			if(current->option == 1)
				printf("Pesar!\n");
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

void attempt_two(){
	int c_l = 0, c_r = 0, c_a = 0;
	int p_l = 0, p_r = 0, p_a = 0;

	printf("current = %d\n", current->option);
	for(;EVER;){
		c_l = get_value(LEFT);
		c_r = get_value(RIGHT);
		c_a = get_value(ACCEPT);
		
		sleep(0.009);

		c_l = c_l & get_value(LEFT);
		c_r = c_r & get_value(RIGHT);
		c_a = c_a & get_value(ACCEPT);

		if(p_l != c_l && c_l){
		// if(c_l){
			printf("LEFT\n");
			printf("%d %d \n", p_l, c_l);
			current = current -> previous;
		}
		if(p_r != c_r && c_r){
		// if(c_r){
			printf("RIGHT\n");
			current = current -> next;
		}
		if(p_a != c_a && c_a){
		// if(c_a){
			printf("ACCEPT\n");
			if(current->option == 1)
				printf("Pesar!\n");
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

void attempt_three(){
	// enum ButtonStates b_l = DOWN, b_r = PRESS, b_a = RELEASE;
	enum ButtonStates b_l= DOWN, b_r=DOWN, b_a=DOWN;

	printf("current = %d\n", current->option);
	for(;EVER;){
		// printf("b_l: %d\n", b_l);
		// printf("b_r: %d\n", b_r);
		// printf("b_a: %d\n", b_a);
		b_l = delay_debounce(b_l, LEFT);
		// sleep(2);
		b_r = delay_debounce(b_r, RIGHT);
		// sleep(2);
		b_a = delay_debounce(b_a, ACCEPT);
		// sleep(2);
		// printf("b_l: %d\n", b_l);
		// printf("b_r: %d\n", b_r);
		// printf("b_a: %d\n", b_a);
		if(b_l == PRESS){
			printf("LEFT\n");
			current = current -> previous;
			b_l = DOWN;
		}
		if(b_r == PRESS){
			printf("RIGHT\n");
			current = current -> next;
			b_r = DOWN;
		}
		if(b_a == PRESS){
			b_a = DOWN;
			printf("ACCEPT\n");
			if(current->option == 1)
				printf("Pesar!\n");
			else if(current->option == 2)
				printf("Calcular offset!\n");
			else{
				printf("terminando ejecución!\n");
				break;
			}
		}
	}

}


enum ButtonStates delay_debounce(enum ButtonStates button_state, int button) {      
	// printf("%d\n", button); 
    if (get_value(button)){                      /* if pressed     */
        if (button_state == PRESS){
        	// printf("is down\n");
            button_state = DOWN;
        } 
        if (button_state == UP){
            sleep(0.04);
            if (get_value(button) == 1){
            	// printf("is press\n");
                button_state = PRESS;
            }
        } 
    } else {                                 /* if not pressed */
        if (button_state == RELEASE){
        	// printf("is up\n");
            button_state = UP;
        } 
        if (button_state == DOWN){
            if (get_value(button) == 0){
                sleep(0.04);
                if (get_value(button) == 0){
                	// printf("is RELEASE\n");
                    button_state = RELEASE;
                }
            }
        }
    }
    // if(button_state == PRESS)
    	// printf("%d fue presionado\n", button);
    return button_state;
}