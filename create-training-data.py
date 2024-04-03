import pandas as pd
import numpy as np
import csv
import re


def add(a, b):
    return a + b


def diff(a, b):
    return abs(a - b)


def multiply(a, b):
    return a * b


def combine_data(array, index1, index2, operation):
    return operation(array[index1], array[index2])


element_data = pd.DataFrame(pd.read_csv("./csv/elements.csv"))
bond_data = pd.DataFrame(pd.read_csv("./csv/bonds.csv"))
training_data = [[], [], [], [], [], [], bond_data["Bond E"]]
bonds = [re.split("-|=|≡", x) for x in bond_data["Bond"].to_list()]

for i in range(len(bonds)):
    atom1 = np.where(element_data["Symbol"] == bonds[i][0])[0][0]
    atom2 = np.where(element_data["Symbol"] == bonds[i][1])[0][0]

    training_data[0].append(combine_data(element_data["Atomic Number"], atom1, atom2, multiply))
    training_data[1].append(combine_data(element_data["Atomic Mass"], atom1, atom2, multiply))
    training_data[2].append(combine_data(element_data["Period"], atom1, atom2, multiply))
    training_data[3].append(combine_data(element_data["Electronegativity"], atom1, atom2, diff))
    training_data[4].append(combine_data(element_data["First Ionization"], atom1, atom2, multiply))
    training_data[5].append(combine_data(element_data["Covalent Radius"], atom1, atom2, add))

with open("./csv/training-data.csv", "w", newline="") as file:
    csvwriter = csv.writer(file)
    csvwriter.writerow(
        [
            "Atomic Number",
            "Atomic Mass",
            "Period",
            "Electronegativity",
            "First Ionization",
            "Covalent Radius",
            "Bond E",
        ]
    )
    csvwriter.writerows(zip(*training_data))
