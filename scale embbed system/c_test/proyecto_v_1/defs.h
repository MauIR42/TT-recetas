#ifndef DEFS_H
#define DEFS_H

//hx711
#define DT_pin  5
#define SCK_pin 6

//rtcc
#define EVER 1
#define DIR_RTCC 0x68

struct datos {
	unsigned char segundos;
	unsigned char minutos; 
	unsigned char horas;
	unsigned char dia;
	unsigned char mes;
	unsigned char anio;
	unsigned char temperatura;
};

//menu
#define LEFT  22
#define ACCEPT  27
#define RIGHT  17

struct node{
	int option;
	char *name;
	struct node *next;
	struct node *previous;
};

//food_list

#define LIST_NAME "lista_comida.txt"
struct list_element{
	char * name;
	int id;

	struct list_element *next;
	struct list_element *previous;
};

#endif