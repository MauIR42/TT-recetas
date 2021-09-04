#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void create_list();

struct list_element *head = NULL;
struct list_element *previous = NULL;

void create_list(){
	int first = 1;
	FILE * fp;
	char str[60];
	char * test;
	fp = fopen("lista_comida.txt", "r");
	if(fp == NULL){
		perror("Error opening file");
		exit(1);
	}

	while( fgets(str, 60, fp)!=NULL){	
		struct list_element * actual = (struct list_element *) malloc(sizeof(struct list_element));
		test = strtok (str, ",");
		if(test == NULL){
			printf("Error!\n");
			exit(1); //marcar error
		}
		actual->name = strdup(test);
		test = strtok (NULL, ",");
		if(test == NULL){
			printf("Error!\n");
			exit(1);
		}
		actual->id = atoi(test);
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
	fclose(fp);
	
}