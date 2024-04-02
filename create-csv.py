import pandas as pd
import numpy as np
import csv

data = pd.DataFrame(pd.read_csv("data.csv"))
x = [[], [], [], [], [], [], []]
bond = np.char.split(data["Bond"].to_list(), "-")


def add(a, b):
    return a + b


def diff(a, b):
    return abs(a - b)


def multiply(a, b):
    return a * b


def combine_data(array, index1, index2, operation):
    return operation(array[index1], array[index2])


newdata = [[], [], [], [], [], []]

for i in range(len(bond)):
    atom1 = np.where(data["Symbol"] == bond[i][0])[0][0]
    atom2 = np.where(data["Symbol"] == bond[i][1])[0][0]

    newdata[0].append(combine_data(
        data["Atomic Number"], atom1, atom2, multiply))
    newdata[1].append(combine_data(
        data["Atomic Mass"], atom1, atom2, multiply))
    newdata[2].append(combine_data(data["Period"], atom1, atom2, multiply))
    newdata[3].append(combine_data(
        data["Electronegativity"], atom1, atom2, diff))
    newdata[4].append(combine_data(
        data["First Ionization"], atom1, atom2, multiply))
    newdata[5].append(combine_data(data["Covalent Radius"], atom1, atom2, add))


# symbol = np.array(data["Symbol"])
# data = data.drop(["Bond", "Symbol"], axis=1)
# x = data.iloc[:, 1:].values
newdata.append(data.iloc[:, 1].values)

# print(x[0][0], x[1][0], x[2][0], x[3][0], x[4][0], x[5][0], x[6][0])
# print(y[0])

with open("newdata.csv", 'w', newline="") as file:
    csvwriter = csv.writer(file)
    csvwriter.writerow(["Atomic Number", "Atomic Mass", "Period",
                        "Electronegativity", "First Ionization", "Covalent Radius", "Bond E"])
    csvwriter.writerows(zip(*newdata))

# matrix = data.corr()
# plt.subplots(figsize=(20,15))
# sns.heatmap(matrix, cmap="Greens", annot=True)


# AtomicNumber,Symbol,Atomic Mass,Period,Group,Electronegativity,First Ionization,Covalent Radius
