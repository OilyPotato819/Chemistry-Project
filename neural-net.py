import pandas as pd
import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import math
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import seaborn as sns

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


for i in range(len(bond)):
    atom1 = np.where(data["Symbol"] == bond[i][0])[0][0]
    atom2 = np.where(data["Symbol"] == bond[i][1])[0][0]

    x[0].append(combine_data(data["Atomic Number"], atom1, atom2, add))
    x[1].append(combine_data(data["Atomic Mass"], atom1, atom2, add))
    x[2].append(combine_data(data["Period"], atom1, atom2, add))
    x[3].append(combine_data(data["Group"], atom1, atom2, add))
    x[4].append(combine_data(data["Electronegativity"], atom1, atom2, diff))
    x[5].append(combine_data(data["First Ionization"], atom1, atom2, add))
    x[6].append(combine_data(data["Covalent Radius"], atom1, atom2, add))

# symbol = np.array(data["Symbol"])
# data = data.drop(["Bond", "Symbol"], axis=1)
# x = data.iloc[:, 1:].values
# y = data.iloc[:, 0].values


# AtomicNumber,Symbol,Atomic Mass,Period,Group,Electronegativity,First Ionization,Covalent Radius
