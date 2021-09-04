#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include "defs.h"
#include "gpio.h"

enum ButtonStates { UP, DOWN, PRESS, RELEASE };

void start_menu();
struct node* read_menu(char * file, struct node *file_father);
enum ButtonStates delay_debounce(enum ButtonStates button_state, int button);

struct node *head = NULL;
struct node *current = NULL;

int main(){

	// struct node *head = read_menu("principal.txt", NULL);
	head = read_menu("principal.txt", NULL);

	printf("Iniciando lectura de datos\n");

	printf("agregando LEFT\n");
	setup_pin(LEFT, "in");

	printf("agregando RIGHT\n");
	setup_pin(RIGHT, "in");

	printf("agregando ACCEPT\n");
	setup_pin(ACCEPT, "in");

	printf("agregando BACK\n");
	setup_pin(BACK_P, "in");

	current = head;

	start_menu();

	printf("Terminando ejemplo\n");
	// close_all();
}

void start_menu(){
	enum ButtonStates b_l= DOWN, b_r=DOWN, b_a=DOWN, b_b=DOWN;

	printf("current = %s\n", current->name);
	for(;EVER;){
		b_l = delay_debounce(b_l, LEFT);
		b_r = delay_debounce(b_r, RIGHT);
		b_a = delay_debounce(b_a, ACCEPT);
		b_b = delay_debounce(b_b, BACK_P);
		if(b_l == PRESS){
			// printf("LEFT\n");
			current = current -> previous;
			b_l = DOWN;
			printf("name: %s\n", current -> name);
		}
		if(b_r == PRESS){
			// printf("RIGHT\n");
			current = current -> next;
			b_r = DOWN;
			printf("name: %s\n", current -> name);
		}
		if(b_a == PRESS){
			b_a = DOWN;
			printf("ACCEPT\n");
			if(current->type == 0 && current->son != NULL){
				current = current -> son;
				printf("name: %s\n", current -> name);
			}
			else if(current->type == 1)
				printf("Pesar!\n");
			else if(current->type == 2)
				printf("Calcular offset!\n");
			else{
				printf("terminando ejecución!\n");
				break;
			}
		}

		if(b_b == PRESS){
			b_b = DOWN;
			if(current->father != NULL)
				current = current -> father;
			printf("BACK\n");
			printf("name: %s\n", current -> name);
		}

	}

}


enum ButtonStates delay_debounce(enum ButtonStates button_state, int button) {      
    if (get_value(button)){                      /* if pressed     */
        if (button_state == PRESS){
            button_state = DOWN;
        } 
        if (button_state == UP){
            sleep(0.04);
            if (get_value(button) == 1){
                button_state = PRESS;
            }
        } 
    } else {                                 /* if not pressed */
        if (button_state == RELEASE){
            button_state = UP;
        } 
        if (button_state == DOWN){
            if (get_value(button) == 0){
                sleep(0.04);
                if (get_value(button) == 0){
                    button_state = RELEASE;
                }
            }
        }
    }
    return button_state;
}

struct node*  read_menu(char * file, struct node *file_father){
	int first = 1;
	FILE * fp;
	char str[60];
	char * test;
	char * break_point;

	struct node *head = NULL;
	struct node *previous = NULL;
	struct node *father = NULL;

	char *aux_name;

	fp = fopen(file, "r");
	if(fp == NULL){
		perror("Error opening file");
		exit(1);
	}

	while( fgets(str, 60, fp)!=NULL){	
		struct node * actual = (struct node *) malloc(sizeof(struct node));
		test = strtok (str, ","); //nombre
		if(test == NULL){
			printf("Error!\n");
			exit(1); //marcar error
		}
		aux_name = strdup(test);
		test = strtok (NULL, ","); //type
		if(test == NULL){ //
			free(actual);
			if((break_point=strchr(aux_name,'\n')) != NULL)
				*break_point = '\0';
			previous -> son = read_menu(aux_name,previous);
			printf("son: %s\n", previous -> son -> name);
			printf("father: %s\n", previous -> name );
		}
		else{
				actual->name = aux_name;
				actual->type = atoi(test);
				test = strtok (NULL, ","); //id
				if(test == NULL){
					actual->id = -1;
				}
				else
					actual->id = atoi(test);
				if(actual -> id > 0 && father != NULL)
					actual -> father = father;
				else if(file_father != NULL){
					actual->father = file_father;
				}
				if(actual->type == 0)
					father = actual;


				if(first){
					first = 0;
					head = actual;
				}
				else{
					previous -> next = actual;
					actual -> previous = previous;
					actual -> next = head;
				}
				previous = actual;
				head -> previous = actual;
		}
	}
	fclose(fp);
	return head;	
}