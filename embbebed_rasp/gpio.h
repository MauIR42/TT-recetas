#ifndef GPIO_H
#define GPIO_H

void setup_pin(int pin_number, char * direction);
void unexport_pin( int pin);
int get_file_descriptor(int pin);
void set_value(int gpio_number, char * value);
int get_value(int gpio);
void close_all();

#endif