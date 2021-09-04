#ifndef UART_H
#define UART_H

void ini_uart();
int config_serial ( char *, speed_t );
void set_user( char *name, char* pass );
void set_wifi( char *ssid, char* psk );
int limit_reached();
#endif
