#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <pthread.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <syslog.h>

#include "defs.h"
#include "communication.h"
#include "processing.h"
#include "gpio.h"

int pipefd[2];

//hx711

int read_averange(int read_count){
	int indx;
	int *reads = (int *) calloc(read_count, sizeof(int));
	int to_trim;
	to_trim = (int) ((float)read_count * 0.2);
	for(indx = 0; indx < read_count; indx++)
		reads[indx] = read_and_format();
	reads = heap_sort(&reads[0], read_count);
	return get_averange(reads,read_count,to_trim); //free reads pending

}

int read_and_format(){
	int data_compressed;
	unsigned char * byte_data = get_data();
	data_compressed = to_int(byte_data);
	return data_compressed;
}

unsigned char * get_data(){
	static unsigned char byte_array[3]; //represents 24 bit data
	while(get_value(DT_pin) != 0)
		continue;
	byte_array[0] = get_byte(); //MSB and 7 bits
	byte_array[1] = get_byte();
	byte_array[2] = get_byte(); //7 bits and LSB
	get_bit();//used for the  gain
	return byte_array;
}

unsigned char get_byte(){
	unsigned char byte = 0x0;
	int indx = 0;
	for(indx = 0; indx<8;indx++){
		byte = byte << 1;
		byte = byte | get_bit(DT_pin);
	}
	return byte;
}

int get_bit(){
	set_value(SCK_pin, "1");
    set_value(SCK_pin, "0");
    return get_value(DT_pin);
}

//rtcc

struct datos* obtener_info(pthread_t thread_id){
	pthread_kill(thread_id, SIGUSR1);
	struct datos *a_cliente;
	a_cliente = (struct datos* )malloc(sizeof(struct datos));
	read(pipefd[0],a_cliente, sizeof(struct datos));
	return a_cliente;
}

void crearTuberia(int pipefd[]){
	int edo_pipe;
	edo_pipe = pipe( pipefd );
	if( edo_pipe == -1){
		syslog(LOG_INFO,"Error al crear la tubería\n");
		exit(EXIT_FAILURE);
	}
}

void ini_daemon(){
    FILE *apArch;

    pid_t pid = 0;
    pid_t sid = 0;

    pid = fork();
    if( pid == -1 )
    {
        syslog(LOG_INFO, "Error al crear el primer proceso hijo\n");
        exit(EXIT_FAILURE);
    }

    if( pid )
    {
        syslog(LOG_INFO, "Se termina proceso padre, PID del proceso hijo %d \n", pid);
        exit(0);
    }

    umask(0);

    sid = setsid();
    if( sid < 0 )
    {
        syslog(LOG_INFO, "Error al iniciar sesion");
        exit(EXIT_FAILURE);
    }

    pid = fork( );
    if( pid == -1 )
    {
        syslog(LOG_INFO, "Error al crear el segundo proceso hijo\n");
        exit(EXIT_FAILURE);
    }
    if( pid )
    {
        syslog(LOG_INFO, "PID del segundo proceso hijo %d \n", pid);
        apArch = fopen("/home/pi/scale.pid", "w");
        fprintf( apArch, "%d", pid);
        fclose(apArch);

        exit(0);
    }

    chdir("/");
    close( STDIN_FILENO  );
    close( STDOUT_FILENO );
    close( STDERR_FILENO );
}