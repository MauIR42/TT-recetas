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

#endif