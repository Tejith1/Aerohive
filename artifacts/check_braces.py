import sys

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    
    for i, char in enumerate(content):
        # find line and col
        line_num = content.count('\n', 0, i) + 1
        col_num = i - content.rfind('\n', 0, i)
        
        if char in '({[':
            stack.append((char, line_num, col_num))
        elif char in ')}]':
            if not stack:
                print(f"Extra closing '{char}' at line {line_num}, col {col_num}")
                return
            top_char, t_line, t_col = stack.pop()
            # check mismatch
            mismatch = False
            if char == ')' and top_char != '(': mismatch = True
            if char == '}' and top_char != '{': mismatch = True
            if char == ']' and top_char != '[': mismatch = True
            if mismatch:
                print(f"Mismatch: '{top_char}' from line {t_line}, col {t_col} closed by '{char}' at line {line_num}, col {col_num}")
                return

    if stack:
        print("Unclosed structures:")
        for char, line, col in stack[-5:]:
            print(f"Unclosed '{char}' at line {line}, col {col}")
    else:
        print("All braces match perfectly!")

if __name__ == '__main__':
    check_file(r"app/pilot-panel/dashboard/page.tsx")
