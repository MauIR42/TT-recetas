#ifndef HILO
#define HILO

void create_food_list();

#define LIST_NAME "lista_comida.txt"
struct list_element{
	char * name;
	int id;

	struct list_element *next;
	struct list_element *previous;
};

#endif