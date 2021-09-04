#ifndef COMM_H
#define COMM_H

//hx711
unsigned char * get_data();
int get_bit();
unsigned char get_byte();
int read_and_format();
int read_averange(int read_count);


//rtcc
void obtener_info(pthread_t thread_id);
void crearTuberia(int pipefd[]);


// void get_reference_unit(); // to_check

#endif