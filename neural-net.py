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
x = data.iloc[:, :6]
y = data.iloc[:, 6]

# matrix = data.corr()
# plt.subplots(figsize=(25, 20))
# sns.heatmap(matrix, cmap="Greens", annot=True)
# plt.show()

model = keras.Sequential()
model.add(keras.layers.Dense(5))
model.add(keras.layers.Dense(1))
x = tf.constant(x)
y = tf.constant(y)
model.compile(optimizer='sgd', loss='mse', metrics=["mse"])
model.fit(x, y, epochs=1)

# model = keras.Sequential()
# model.add(keras.Input(shape=(593, 6)))
# model.add(keras.layers.Dense(8))
# model.compile(optimizer='sgd', loss='mse')

# model.fit(tf.constant(x), tf.constant(y), batch_size=32, epochs=10)
