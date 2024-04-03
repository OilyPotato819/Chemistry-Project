import pandas as pd
import numpy as np
import tensorflow as tf
import keras
import matplotlib.pyplot as plt
import math
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import seaborn as sns
from sklearn.linear_model import LinearRegression

data = pd.DataFrame(pd.read_csv("./csv/training-data.csv")).dropna()
x = data.iloc[:, [3, 5]]
y = data.iloc[:, 6]

# matrix = data.corr()
# plt.subplots(figsize=(25, 20))
# sns.heatmap(matrix, cmap="Greens", annot=True)
# plt.show()
model = keras.Sequential()
model.add(keras.layers.Dense(10))
model.add(keras.layers.Dense(10))
model.add(keras.layers.Dense(10))
model.add(keras.layers.Dense(1))
x = tf.constant(x)
y = tf.constant(y)
# model.compile(optimizer=keras.optimizers.SGD(
#     learning_rate=0.001), loss='mae', metrics=["mae"])
model.compile(optimizer="Adam", loss="mae", metrics=["mae"])
model.fit(x, y, epochs=1)


def getError(predicted, experimental):
    average = np.add(predicted, experimental)

    error = []
    for i in range(len(predicted)):
        error.append(abs(predicted[i] - experimental[i]))
    average = sum(error) / len(error)
    max_error = max(error)

    print(f"Average Error: {average}")
    print(f"Max Error: {max_error}")


# getError(model.predict(x).flatten(), y.numpy())
# electronegativity = list(zip(*x))
# print(electronegativity)
# LinearRegression().fit(electronegativity.numpy().reshape(-1, 1), y)
# y_pred = model.predict(electronegativity)
# plt.scatter(electronegativity, y, color="b")
# plt.plot(electronegativity, y_pred, color="k")
