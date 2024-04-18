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


def array_string(array, index1, index2):
    return str([array[index1], array[index2]])


element_data = pd.DataFrame(pd.read_csv("../csv/elements.csv"))
bond_data = pd.DataFrame(pd.read_csv("../csv/bonds.csv"))
bond_energy = bond_data["Bond E"].to_list()
training_data = [bond_energy]
bonds = [re.split("-|=|≡", x) for x in bond_data["Bond"].to_list()]

for n in range(12):
    training_data.append([])

for i in range(len(bonds)):
    atoms = [
        np.where(element_data["Symbol"] == bonds[i][0])[0][0],
        np.where(element_data["Symbol"] == bonds[i][1])[0][0],
    ]

    if atoms[0] == atoms[1]:
        bond_energy[i] = None

    atom1 = min(atoms, key=lambda x: element_data["Atomic Number"][x])
    atom2 = atoms[1 - atoms.index(atom1)]

    training_data[1].append(combine_data(element_data["Electronegativity"], atom1, atom2, diff))
    training_data[2].append(combine_data(element_data["Covalent Radius"], atom1, atom2, add))
    training_data[3].append(element_data["Atomic Number"][atom1])
    training_data[4].append(element_data["Atomic Number"][atom2])
    training_data[5].append(element_data["Atomic Mass"][atom1])
    training_data[6].append(element_data["Atomic Mass"][atom2])
    training_data[7].append(element_data["Period"][atom1])
    training_data[8].append(element_data["Period"][atom2])
    training_data[9].append(element_data["First Ionization"][atom1])
    training_data[10].append(element_data["First Ionization"][atom2])
    training_data[11].append(element_data["Atomic Radius"][atom1])
    training_data[12].append(element_data["Atomic Radius"][atom2])

with open("../csv/training-data.csv", "w", newline="") as file:
    csvwriter = csv.writer(file)
    csvwriter.writerow(
        [
            "Bond E",
            "Electronegativity",
            "Covalent Radius",
            "Atomic Number 1",
            "Atomic Number 2",
            "Atomic Mass 1",
            "Atomic Mass 2",
            "Period 1",
            "Period 2",
            "First Ionization 1",
            "First Ionization 2",
            "Atomic Radius 1",
            "Atomic Radius 2",
        ]
    )
    csvwriter.writerows(zip(*training_data))
