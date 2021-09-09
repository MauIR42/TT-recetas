#ifndef HX711_H
#define HX711_H

void power_up();
void reset_hx711();
void tare_scale();
int get_weight(int times);
void power_down();

#endif