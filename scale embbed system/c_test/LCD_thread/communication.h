#ifndef COMM_H
#define COMM_H

//hx711

//rtcc
void obtener_info(pthread_t thread_id);
void crearTuberia(int pipefd[]);

void send_string( pthread_t thread_id, char text[] );

// void get_reference_unit(); // to_check

#endif