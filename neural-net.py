import pandas as pd
import numpy as np
import tensorflow as tf
import keras
import matplotlib.pyplot as plt
import math
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import seaborn as sns

data = pd.DataFrame(pd.read_csv("newdata.csv")).dropna()
x = data.iloc[:, [3, 4, 5]]
y = data.iloc[:, 6]

# matrix = data.corr()
# plt.subplots(figsize=(25, 20))
# sns.heatmap(matrix, cmap="Greens", annot=True)
# plt.show()
model = keras.Sequential()
model.add(keras.layers.Dense(6))
model.add(keras.layers.Dense(6))
model.add(keras.layers.Dense(6))
model.add(keras.layers.Dense(6))
model.add(keras.layers.Dense(1))
x = tf.constant(x)
y = tf.constant(y)
# model.compile(optimizer=keras.optimizers.SGD(
#     learning_rate=0.001), loss='mae', metrics=["mae"])
model.compile(optimizer='Adam', loss='mae', metrics=["mae"])
model.fit(x, y, epochs=25)
predicted = model.predict(x)
experimental = y.numpy()
average = np.add(predicted, experimental)

error = []
for i in range(len(predicted)):
    error.append(abs(predicted[i][0] - experimental[i]))
average = sum(error) / len(error)

# test = np.array([x[0]])
# print(model.predict(test)[0][0])
# print(np.array(y[0]))

# electronegativity = list(zip(*x.numpy()))[5]
# plt.scatter(electronegativity, y)
# plt.show()

print("Average: " + str(average))
