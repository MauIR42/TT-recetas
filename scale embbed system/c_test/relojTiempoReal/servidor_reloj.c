#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <termios.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/wait.h> 
#include <netinet/in.h>
#include <signal.h>
#include <wiringPi.h>
#include <wiringPiI2C.h>
#include <syslog.h>
#include <sys/types.h>
#include <sys/stat.h>

#define EVER 1
#define PUERTO 			5002	//Número de puerto asignado al servidor
#define COLA_CLIENTES 		5 	//Tamaño de la cola de espera para clientes
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

int sockfd;
int pipefd[2];
struct datos datosHilo;

void * funHilo( void * arg );

void manejador( int sig);
void ini_servidor();
void escuchar_peticiones(pthread_t thread_id);
void atender_cliente(int cliente_sockfd);

void crearTuberia(int pipefd[]);

void iniDemonio(); 

int main()
{
	iniDemonio();
	pthread_t thread_id;

	crearTuberia(pipefd);

	pthread_create( &thread_id, NULL, funHilo, NULL);
	ini_servidor();

	escuchar_peticiones(thread_id);
	
	return 0;
}

void crearTuberia(int pipefd[]){
	int edo_pipe;
	edo_pipe = pipe( pipefd );
	if( edo_pipe == -1){
		syslog(LOG_INFO, "Error al crear la tubería\n");
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
	int estado;
	pid_t pid;
	if( sig == SIGCHLD){
		syslog(LOG_INFO, "Se recibio la señal de un proceso hijo en el servidor\n");
		pid = wait(&estado);
		syslog(LOG_INFO, "Termino el proceso %d con el estado %d\n", pid, estado);
	}
	else if( sig == SIGINT){
		syslog(LOG_INFO, "Se recibió la señal SIGINT, concluyendo con el socket\n");
	   	close (sockfd);
	   	exit(0);
	}
	else if( sig == SIGUSR1){
		syslog(LOG_INFO, "Se recibió la señal para enviar los datos al cliente\n");
		write(pipefd[1],&datosHilo,sizeof(struct datos));
	}
}

void ini_servidor(){
   	struct sockaddr_in direccion_servidor; 

   	memset (&direccion_servidor, 0, sizeof (direccion_servidor));	
   	direccion_servidor.sin_family 		= AF_INET;
   	direccion_servidor.sin_port 		= htons(PUERTO);
   	direccion_servidor.sin_addr.s_addr 	= INADDR_ANY;

	if(signal(SIGCHLD, manejador) == SIG_ERR ){
		syslog(LOG_INFO, "Error en el manejador");
		exit(EXIT_FAILURE);
	}

	if(signal(SIGINT, manejador) == SIG_ERR ){
		syslog(LOG_INFO, "Error en el manejador");
		exit(EXIT_FAILURE);
	}

	if(signal(SIGUSR1, manejador) == SIG_ERR){
		syslog(LOG_INFO, "Error en el manejador");
		exit(EXIT_FAILURE);
	}


   	syslog(LOG_INFO, "Creando Socket ....\n");
   	if( (sockfd = socket (AF_INET, SOCK_STREAM, 0)) < 0 )
	{
		syslog(LOG_INFO, "Ocurrio un problema en la creacion del socket");
		exit(1);
   	}

   	syslog(LOG_INFO, "Configurando socket ...\n");
   	if( bind(sockfd, (struct sockaddr *) &direccion_servidor, sizeof(direccion_servidor)) < 0 )
	{
		syslog(LOG_INFO, "Ocurrio un problema al configurar el socket");
		exit(1);
   	}

   	syslog(LOG_INFO, "Estableciendo la aceptacion de clientes...\n");
	if( listen(sockfd, COLA_CLIENTES) < 0 )
	{
		syslog(LOG_INFO, "Ocurrio un problema al crear la cola de aceptar peticiones de los clientes");
		exit(1);
   	}
}

void escuchar_peticiones(pthread_t thread_id){
	int cliente_sockfd;
	pid_t pid;
	for(;EVER;)
	{
	   	syslog(LOG_INFO, "En espera de peticiones de conexión ...\n");
   		if( (cliente_sockfd = accept(sockfd, NULL, NULL)) < 0 )
		{
			syslog(LOG_INFO, "Ocurrio algun problema al atender a un cliente");
			exit(1);
   		}
   		syslog(LOG_INFO, "Se conecta\n");
		pid = fork();
		if( !pid )
		{
			atender_cliente(cliente_sockfd);
		}
		else{
			pthread_kill(thread_id, SIGUSR1);
		}
	}
   	syslog(LOG_INFO, "Concluimos la ejecución de la aplicacion Servidor \n");

}

void atender_cliente(int cliente_sockfd){
	struct datos a_cliente;
	read(pipefd[0],&a_cliente, sizeof(struct datos));
   	syslog(LOG_INFO, "Se aceptó un cliente, atendiendolo \n");
	if( write (cliente_sockfd, (void *)&a_cliente, sizeof(struct datos)) < 0 )
	{
		syslog(LOG_INFO, "Ocurrio un problema en el envio de un mensaje al cliente");
		exit(EXIT_FAILURE);
   	}
	close (cliente_sockfd);
	exit(0);
}

void iniDemonio(){
        FILE *apArch;

    pid_t pid = 0;
    pid_t sid = 0;

    pid = fork();
    if( pid == -1 )
    {
        perror("Error al crear el primer proceso hijo\n");
        exit(EXIT_FAILURE);
    }

    if( pid )
    {
        printf("Se termina proceso padre, PID del proceso hijo %d \n", pid);
        exit(0);
    }

    umask(0);

    sid = setsid();
    if( sid < 0 )
    {
        perror("Error al iniciar sesion");
        exit(EXIT_FAILURE);
    }

    pid = fork( );
    if( pid == -1 )
    {
        perror("Error al crear el segundo proceso hijo\n");
        exit(EXIT_FAILURE);
    }
    if( pid )
    {
        printf("PID del segundo proceso hijo %d \n", pid);
        apArch = fopen("/home/pi/reloj.pid", "w");
        fprintf(apArch, "%d", pid);
        fclose(apArch);

        exit(0);
    }

    chdir("/");
    close( STDIN_FILENO  );
    close( STDOUT_FILENO );
    close( STDERR_FILENO );
}