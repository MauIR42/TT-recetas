#include <stdlib.h>
#include "defs.h"
#include "communication.h"
#include "processing.h"
#include "gpio.h"

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

// void get_reference_unit(){
// 	int value = get_weight(20);
// 	reference_unit = value;

// }
