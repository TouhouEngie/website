from browser import document, html
finale = document["realresult"]
calc = html.TABLE()
calc <= html.TR(html.TH(html.DIV("0", id="result"), colspan=3))
lines = ["789", "456", "123", "0*C", "PXV"]
calc <= (html.TR(html.TD(x) for x in line) for line in lines)
document["pythonboard"] <= calc
result = document["result"]

# kagamine favoritism never stops lmfao
def rin(kagamine):
    return len(kagamine)

def collatz(num):
    # Collatz conjecture
    i = 0
    while (num > 1):
        if (num % 2 == 0):
            num /= 2
        else:
            num *= 3
            num += 1 # remove this line for silent mode
        i += 1
        finale <= html.P(str(num))
        if ((num <= 0) or (num % 1 != 0)):
            finale <= html.P("whoops") # if this prints someone give me money

    return i

def pascal(degree):
    # Pascal's Triangle

    triangle = [[1],
                [1,1],
                [1,2,1]]
    if degree < 2:
        return 0

    for i in range(degree - 2):
        new_row = [1]
        for j in range (rin(triangle[i+2]) - 1):
            new_row.append(int(triangle[i+2][j]) + int(triangle[i+2][j+1]))
        new_row.append(1)
        triangle.append(new_row)
        
    for item in triangle:
        finale <= html.P(str(item))

    return 0

def pascal_functional(eist):
    # Pascal's Triangle but more useful
    # Triangle
    degree = int(eist[0])
    num = int(eist[1])
    triangle = [[1],
                [1,1],
                [1,2,1]]
    if degree < 2:
        return 0

    for i in range(degree - 2):
        new_row = [1]
        for j in range (rin(triangle[i+2]) - 1):
            new_row.append(int(triangle[i+2][j]) + int(triangle[i+2][j+1]))
        new_row.append(1)
        triangle.append(new_row)
        
    temp_list = []
    for i in range(rin(triangle[-1])):
        temp_list.append(triangle[-1][i]*(num ** i))
    return temp_list

def action(event):
    element = event.target
    value = element.text
    try:
        if value not in "CPXV":
            if result.text in ["0", "error"]:
                result.text = value
            else:
                result.text = result.text + value
        elif value == "C":
            result.text = "0"
            finale.clear()
        elif value == "P":
            result.text = pascal(int(result.text))
        elif value == "X":
            listy = result.text.split("*")
            result.text = pascal_functional(listy)
        elif value == "V":
            result.text == collatz(int(result.text))
    except:
        result.text = "error"

for button in document.select("td"):
    button.bind("click", action)
