#ifndef DEFS_H
#define DEFS_H


#define LEFT  22
#define ACCEPT  27
#define RIGHT  17
#define EVER 1
// #define SCK_pin 6

struct node{
	int option;

	struct node *next;
	struct node *previous;
};

#endif