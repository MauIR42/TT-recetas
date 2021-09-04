#ifndef COMM_H
#define COMM_H

//hx711
unsigned char * get_data();
int get_bit();
unsigned char get_byte();
int read_and_format();
int read_averange(int read_count);


//rtcc
struct datos* obtener_info(pthread_t thread_id);
void crearTuberia(int pipefd[]);

//daemon
void ini_daemon();
// void get_reference_unit(); // to_check

#endif