#include <unistd.h>
#include <pthread.h>
#include "defs.h"
#include "hx711.h"
#include "gpio.h"
#include "communication.h"

int offset = 0;
int reference_unit = 83;
void power_up(){
	set_value(SCK_pin, "0");
	sleep(0.0001);
	get_data();
}

void reset_hx711(){
	power_down();
	power_up();
}

void tare_scale(){
	int value = read_averange(15);
	offset = value;
}

int get_weight(int times){
	int value = read_averange(times) - offset;
	return value = value / reference_unit;
}

void power_down(){
	set_value(SCK_pin, "0");
	set_value(SCK_pin, "1");
	sleep(0.0001);
}
