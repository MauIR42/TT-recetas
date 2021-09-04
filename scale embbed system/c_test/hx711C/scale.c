#include <stdio.h>
#include <unistd.h>
#include "defs.h"
#include "gpio.h"
#include "hx711.h"
#include "signals.h"

int  SCK_fd;

int main(){

	ini_senales();

	printf("agregando DT\n");
	setup_pin(DT_pin, "in");

	printf("agregando SCK\n");
	setup_pin(SCK_pin, "out");
	SCK_fd = get_file_descriptor(SCK_pin);
	sleep(1);

	printf("Reiniciando Hx711\n");
	reset_hx711();

	printf("Obteniendo el offset\n");
	tare_scale();

	printf("Coloque el objeto a pesar\n");
	sleep(3);
	int indx, weight;
	for(indx = 0; indx < 200; indx++){
		weight =get_weight(5);
		printf("%d\n", weight);
	}
	close_all();
}