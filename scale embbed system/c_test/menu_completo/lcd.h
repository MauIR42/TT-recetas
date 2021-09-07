#ifndef LCD_H
#define LCD_H

void writeIns8(unsigned char ins, char *is_char);
void pulse_enable();
void writeWord(char * word);
void change_display_line(int line);
void clear_display();
void clear_display_line(int line);
void ini_LCD();

#endif
