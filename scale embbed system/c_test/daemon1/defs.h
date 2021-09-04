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
#define BACK_P 26

enum ButtonStates { UP, DOWN, PRESS, RELEASE };

struct node{
	int id;
	int type;
	char *name;
	struct node *next;
	struct node *previous;
	struct node *son;
	struct node *father;
};

// display 16x2

#define RS 23
#define EN 24
#define DB4 25
#define DB5 8
#define DB6 7
#define DB7 12

// #define GPIOS 
#define GPIOS_N 12
#define DB_N 4
#define LCD_N 6

#endif