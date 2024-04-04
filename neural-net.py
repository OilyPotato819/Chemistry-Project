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

x = tf.constant(data.iloc[:, 1:])
y = tf.constant(data.iloc[:, 0])

model = keras.Sequential()
model.add(keras.layers.Dense(20))
model.add(keras.layers.Dense(20))
model.add(keras.layers.Dense(20))
model.add(keras.layers.Dense(1))

model.compile(optimizer="Adam", loss="mae", metrics=["mae"])
model.fit(x, y, epochs=1)


def getError(predicted, experimental):
    average = np.add(predicted, experimental)

    error = []
    for i in range(len(predicted)):
        error.append(abs(predicted[i] - experimental[i]))
    average = sum(error) / len(error)
    max_error = max(error)

    print()
    print(f"Average Error: {average}")
    print(f"Max Error: {max_error}")
    print(error)


getError(model.predict(x).flatten(), y.numpy())

# model.save('my_model.keras')

electronegativity = np.array(list(x.numpy().T[11])).reshape((-1, 1))
bond_energy = np.array(list(y.numpy()))
model1 = LinearRegression().fit(
    electronegativity,
    bond_energy,
)
y_pred = model1.predict(electronegativity)
plt.scatter(electronegativity, bond_energy, color="b")
plt.plot(electronegativity, y_pred, color="k")
plt.show()
