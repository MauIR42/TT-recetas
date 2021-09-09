
#include <wiringPi.h>
#include <wiringPiI2C.h>
#include <pthread.h>
#include <unistd.h>
#include <stdlib.h>

#include "defs.h"
#include "hilo.h"

struct datos datosHilo;

void * funHilo( void * arg){
	int iic_fd;
	iic_fd = wiringPiI2CSetup( DIR_RTCC );
	if( iic_fd == -1){
		exit(EXIT_FAILURE);
	}
	for(;EVER;){
		sleep(10);
	// unsigned char segundos = 0x39, minutos = 0x17, horas=0x14, dia,mes,anio;
	// unsigned char temperatura;
	// 	segundos = wiringPiI2CReadReg8(iic_fd,0);
	// 	usleep(2000);
	// 	minutos = wiringPiI2CReadReg8(iic_fd,1);
	// 	usleep(2000);
	// 	horas = wiringPiI2CReadReg8(iic_fd,2);
	// 	usleep(2000);
	// 	dia = wiringPiI2CReadReg8(iic_fd,4);
	// 	usleep(2000);
	// 	mes = wiringPiI2CReadReg8(iic_fd,5);
	// 	usleep(2000);
	// 	anio = wiringPiI2CReadReg8(iic_fd,6);
	// 	usleep(2000);
	// 	temperatura = wiringPiI2CReadReg8(iic_fd,0x11);
	// 	usleep(2000);

	// 	datosHilo.segundos = segundos;
	// 	datosHilo.minutos = minutos;
	// 	datosHilo.horas = horas;
	// 	datosHilo.dia = dia;
	// 	datosHilo.mes = mes;
	// 	datosHilo.anio = anio;
	// 	datosHilo.temperatura = temperatura;
	}
	exit( 0 );
}