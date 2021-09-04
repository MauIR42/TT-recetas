#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <signal.h>
#include <wiringPi.h>
#include <wiringPiI2C.h>
#include <sys/types.h>

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

int pipefd[2];
struct datos datosHilo;

void * funHilo( void * arg );

void manejador( int sig);
void ini_bascula(pthread_t thread_id);
void obtener_info();

void crearTuberia(int pipefd[]);

void ini_signals();


int main()
{
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);

	ini_signals();

	ini_bascula(thread_id);
	
	return 0;
}

void crearTuberia(int pipefd[]){
	int edo_pipe;
	edo_pipe = pipe( pipefd );
	if( edo_pipe == -1){
		printf("Error al crear la tubería\n");
		exit(EXIT_FAILURE);
	}
}

void * funHilo( void * arg){
	int iic_fd;
	iic_fd = wiringPiI2CSetup( DIR_RTCC );
	if( iic_fd == -1){
		exit(EXIT_FAILURE);
	}
	for(;EVER;){
	unsigned char segundos = 0x39, minutos = 0x17, horas=0x14, dia,mes,anio;
	unsigned char temperatura;
		segundos = wiringPiI2CReadReg8(iic_fd,0);
		usleep(2000);
		minutos = wiringPiI2CReadReg8(iic_fd,1);
		usleep(2000);
		horas = wiringPiI2CReadReg8(iic_fd,2);
		usleep(2000);
		dia = wiringPiI2CReadReg8(iic_fd,4);
		usleep(2000);
		mes = wiringPiI2CReadReg8(iic_fd,5);
		usleep(2000);
		anio = wiringPiI2CReadReg8(iic_fd,6);
		usleep(2000);
		temperatura = wiringPiI2CReadReg8(iic_fd,0x11);
		usleep(2000);

		datosHilo.segundos = segundos;
		datosHilo.minutos = minutos;
		datosHilo.horas = horas;
		datosHilo.dia = dia;
		datosHilo.mes = mes;
		datosHilo.anio = anio;
		datosHilo.temperatura = temperatura;
	}
	exit( 0 );
}

void manejador( int sig){
	if( sig == SIGINT){
		printf("Se recibió la señal SIGINT, concluyendo con el socket\n");
	   	exit(0);
	}
	else if( sig == SIGUSR1){
		printf("Se recibió la señal para enviar los datos al cliente\n");
		write(pipefd[1],&datosHilo,sizeof(struct datos));
	}
}

void ini_signals(){

	if(signal(SIGINT, manejador) == SIG_ERR ){
		printf("Error en el manejador");
		exit(EXIT_FAILURE);
	}

	if(signal(SIGUSR1, manejador) == SIG_ERR){
		printf("Error en el manejador");
		exit(EXIT_FAILURE);
	}
}

void ini_bascula(pthread_t thread_id){
	int decision = 0;
	for(;EVER;)
	{
	   	printf("En espera, presione 1 cuando desee saber la hora...\n");
	   	scanf("%d", &decision);
   		if( decision != 1 ){
			printf("Aún no está listo el usuario\n");
			continue;
   		}
   		printf("Listo para enviar los datos\n");
		obtener_info();
	}

}

void obtener_info(){
	pthread_kill(thread_id, SIGUSR1);
	struct datos a_cliente;
	read(pipefd[0],&a_cliente, sizeof(struct datos));
   	printf("Obteniendo información del cliente : \n");

   	printf("La hora es : %x:%x:%x\n", a_cliente.horas,a_cliente.minutos,a_cliente.segundos );
	printf("La fecha es : %x/%x/%x\n", a_cliente.dia,a_cliente.mes,a_cliente.anio);
	printf("La temperatura es : %d\n", (int)a_cliente.temperatura);
}