#include <stdio.h>
#include <unistd.h>
#include <stdlib.h>
#include <string.h>

#include "defs.h"
#include "gpio.h"
#include "menu.h"

extern char * current_user;

struct node* create_menu(int init){

	struct node *head = NULL;
	// printf("Leyendo el menú\n");
	head = read_menu("principal.txt", NULL);

	// printf("Iniciando lectura de datos\n");
	if( init ){
		// printf("agregando LEFT\n");
		setup_pin(LEFT, "in");

		// printf("agregando RIGHT\n");
		setup_pin(RIGHT, "in");

		// printf("agregando ACCEPT\n");
		setup_pin(ACCEPT, "in");

		// printf("agregando BACK\n");
		setup_pin(BACK_P, "in");
	}

	// printf("Terminanda la creación del menú\n");
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

	struct node *head = NULL;
	struct node *previous = NULL;

	char *aux_name;
	char file_path[60];

	if( access(file,F_OK) != 0){
		// sprintf(file_path,"/home/pi/Documents/scale_info/%s/%s", current_user, file);
		sprintf(file_path,"%s/%s", current_user, file);
		if(access(file_path,F_OK) != 0)
			return NULL;
	}
	else{
		// sprintf(file_path,"/home/pi/Documents/scale_info/%s",file);
		sprintf(file_path,"%s",file);
	}

	fp = fopen(file_path, "r");
	if(fp == NULL){
		perror("Error opening file");
		return NULL;
	}

	while( fgets(str, 60, fp)!=NULL){	
		struct node * actual = (struct node *) malloc(sizeof(struct node));
		actual -> next = NULL;
		actual -> previous = NULL;
		actual -> son = NULL;
		actual -> father = NULL;
		test = strtok (str, ","); //nombre
		if(test == NULL){
			// printf("Error!\n");
			exit(1); //marcar error
		}
		aux_name = strdup(test);
		test = strtok (NULL, ","); //type
		if((break_point=strchr(aux_name,'\n')) != NULL)
				*break_point = '\0';
		if(test == NULL && check_substring(aux_name,".txt")) //read_file
			previous -> son = read_menu(aux_name,previous);
		else{
				actual->name = aux_name;
				if(file_father != NULL && file_father -> id != -1)
					actual -> type = file_father -> id;
				else
					actual->type = atoi(test);
				test = strtok (NULL, ","); //id
				if(test == NULL){
					actual->id = -1;
				}
				else
					actual->id = atoi(test);
				// if(actual -> id > 0 && father != NULL)
				// 	actual -> father = father;
				if(file_father != NULL){//else
					actual->father = file_father;
				}
				// if(actual->type == 0)
				// 	father = actual;


				if(first){
					first = 0;
					head = actual;
					head -> next = actual;
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

void free_menu(struct node * to_erase){
	if(to_erase != NULL){
		struct node * first = to_erase;
		struct node *current = to_erase -> next;
		struct node *next = current ->next;
		while((strcmp(first->name,current->name)) != 0){
			if(current ->son != NULL)
				free_menu(current->son);
			free(current -> name);
			current -> name = NULL;
			current -> next = NULL;
			current -> son = NULL;
			current -> father = NULL;
			current -> previous = NULL;
			free(current);
			current = NULL;
			current = next;
			next = current ->next;
		}
		if(current != NULL){
			if(current -> son != NULL)
				free_menu(current->son);
			free(current -> name);
			current -> name = NULL;
			current -> next = NULL;
			current -> son = NULL;
			current -> father = NULL;
			current -> previous = NULL;
			free(current);
			current = NULL;
		}
	}
}

int check_substring(char * text, char * subs){
	int txt_indx = 0, sub_indx = 0, len_subs = strlen(subs), len_text = strlen(text),found = 0;
	if(len_subs > len_text)
		return 0;
	while( text[txt_indx] != '\0' && !found){
		if(text[txt_indx] == subs[sub_indx])
			++sub_indx;
		else{
			if(sub_indx > 0 && text[txt_indx] == subs[0])
				sub_indx = 1;
			else
				sub_indx = 0;
		}
		if(sub_indx == len_subs)
			found = 1;
		++txt_indx;
	}
	return found;
}