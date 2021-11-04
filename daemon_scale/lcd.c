#include <stdio.h>
#include <unistd.h>
#include <string.h>
#include "defs.h"	
#include "gpio.h"
#include "lcd.h"

int LCD_GPIOS[LCD_N] = { DB7, DB6, DB5, DB4, RS, EN };
int DB[DB_N] = { DB7, DB6, DB5, DB4 };

unsigned char lines[2] = {0x80,0xC0};

void ini_LCD(){
	int i;
	for(i = 0; i<LCD_N; i++ ){

		setup_pin(LCD_GPIOS[i], "out");
	}

	// printf("Esperar 15ms\n");

	sleep(0.1);
	// printf("Establecer funcion\n"); 
	writeIns8(0x33, "0"); // "00110011" function set

	// printf("Establecer modo \"Function_set\"\n");

	writeIns8(0x32, "0"); // "00110010" function set

	writeIns8(0xC, "0"); //12 "00001100" Display on, cursor off, blink off

	writeIns8(0x28, "0"); // "00101000" set display mode 4 bits data, 2 lines

	// printf("apagar display\n"); // "1000" apagar display, apagar cursor, apagar blink

	writeIns8(0x6, "0"); // increment ddram by 1 per character 

	clear_display();

}

void writeWord(char * word){
	int indx, len = strlen(word);
	// clear_display();
	for(indx = 0; indx < len; indx++ ){
		if(word[indx] == '\n')
			change_display_line(1);
		else
			writeIns8( word[indx], "1" );
	}

}

void change_display_line(int line){
	writeIns8(lines[line], "0");
}

void clear_display_line(int line){
	unsigned char limit = lines[line] + 0x16, indx;
	change_display_line(1);
	for(indx = lines[line]; indx < limit; indx = indx + 0x1){
		writeIns8(' ', "1");
	}
	change_display_line(0);
}

void clear_display(){
	writeIns8(0x1, "0");
	usleep(3000);

}

void writeIns8(unsigned char ins, char *is_char){
	// printf("DB7 DB6 DB5 DB4\n");
	char value[2];
	usleep(1000);
	set_value(RS, is_char);
	// printf("RS: %s\n", is_char);

	sprintf(value,"%d",((ins >> 7) & 0x1));
	set_value(DB7,value);
	sprintf(value,"%d",((ins >> 6) & 0x1));
	set_value(DB6,value);
	sprintf(value,"%d",((ins >> 5) & 0x1));
	set_value(DB5,value);
	sprintf(value,"%d",((ins >> 4) & 0x1));
	set_value(DB4,value);
	pulse_enable();
	sprintf(value,"%d",((ins >> 3) & 0x1));
	set_value(DB7,value);
	sprintf(value,"%d",((ins >> 2) & 0x1));
	set_value(DB6,value);
	sprintf(value,"%d",((ins >> 1) & 0x1));
	set_value(DB5,value);
	sprintf(value,"%d",((ins) & 0x1));
	set_value(DB4,value);
	pulse_enable();
}

void pulse_enable(){
	set_value(EN, "0");
	usleep(1);
	set_value(EN, "1");
	usleep(1);
	set_value(EN, "0");
	usleep(1);

}