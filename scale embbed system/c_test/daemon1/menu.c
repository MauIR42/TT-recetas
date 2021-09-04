#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>
#include <syslog.h>

#include "defs.h"
#include "gpio.h"
#include "menu.h"
// void start_menu();
struct node *head = NULL;

struct node* create_menu(){

	// struct node *head = read_menu("principal.txt", NULL);
	syslog(LOG_INFO,"Creando el menú\n");
	head = read_menu("principal.txt", NULL);

	setup_pin(LEFT, "in");
	setup_pin(RIGHT, "in");
	setup_pin(ACCEPT, "in");
	setup_pin(BACK_P, "in");

	syslog(LOG_INFO,"Terminanda la creación del menú\n");
	return head;
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
	char file_path[60];
	struct node *head = NULL;
	struct node *previous = NULL;
	struct node *father = NULL;
	sprintf(file_path,"/home/pi/Documents/scale_info/%s",file);
	char *aux_name;
	syslog(LOG_INFO,"Abriendo : %s", file_path);
	fp = fopen(file_path, "r");
	if(fp == NULL){
		syslog(LOG_INFO,"Error opening file");
		exit(1);
	}

	while( fgets(str, 60, fp)!=NULL){	
		struct node * actual = (struct node *) malloc(sizeof(struct node));
		test = strtok (str, ","); //nombre
		if(test == NULL){
			syslog(LOG_INFO,"Error!\n");
			exit(1); //marcar error
		}
		aux_name = strdup(test);
		test = strtok (NULL, ","); //type
		if(test == NULL){ //
			free(actual);
			if((break_point=strchr(aux_name,'\n')) != NULL)
				*break_point = '\0';
			previous -> son = read_menu(aux_name,previous);
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
	// free(aux_name);
	return head;	
}

void free_menu(struct node * to_erase){
	struct node * first = to_erase;
	struct node *current = to_erase -> next;
	struct node *next = current ->next;
	while((strcmp(first->name,current->name)) != 0){
		if(current ->son != NULL)
			free_menu(current->son);
		free(current -> name);
		free(current);
		current = next;
		next = current ->next;
	}
	if(current != NULL){
		if(current -> son != NULL)
			free_menu(current->son);
		free(current -> name);
		free(current);
	}

}