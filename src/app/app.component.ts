import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  stocks = {};
  stocksList = [];

  constructor() { }

  ngOnInit() {

    /**
     * Create WebSocket.
     */

    const url = 'ws://stocks.mnet.website';
    const socket = new WebSocket(url);

    /**
     * Handle error.
     */

    socket.addEventListener('error', (event) => {

      alert('Sorry! We could not establish a connection with the server.\
      Please refresh the page to try again. If this error continues, please contact support.');

    });

    /**
     * Subscribe to messages.
     */

    socket.addEventListener('message', (event) => {

      /**
       * Get current time.
       */

      const updatedTime = this.getTime();

      /**
       * Reset status of existing stocks to
       * remove highlight class.
       */

      this.resetState();

      /**
       * WebSocket data is string.
       * Convert it to JavaScript object.
       */

      let ticker = event.data;
      ticker = JSON.parse(ticker);

      /**
       * For each stock, merge data from
       * server with existing data.
       */

      ticker.forEach(tick => {

        let status = 0;

        /**
         * Stock name is first element.
         */

        const name = tick[0];

        /**
         * Price is second element.
         * Also, convert it to 2 decimals.
         */

        let currentPrice = tick[1];
        currentPrice = currentPrice.toFixed(2);

        /**
         * Stocks are stored in an object with
         * their name being the key.
         *
         * ---
         * New stock:
         *
         * If we do not find the stock in the object,
         * then this is the first time the stock data was sent.
         *
         * Status of such stocks is 0.
         *
         * ---
         * Existing stock:
         *
         * If we do find the stock in the object,
         * this stock was sent earlier and we need to compare
         * the current price with the price stored to decide
         * the status of the stock.
         *
         * Status when currentPrice < storedPrice is -1.
         * Status when currentPrice > storedPrice is 1.
         */

        if (this.stocks.hasOwnProperty(name)) {

          const stockData = this.stocks[name];
          const storedPrice = stockData.price;

          if (currentPrice < storedPrice) {
            status = -1;
          } else if (currentPrice > storedPrice) {
            status = 1;
          }

        }

        /**
         * Update stock data.
         */

        this.stocks[name] = {
          price: currentPrice,
          updated: updatedTime,
          status: status,
        };

      });

      /**
       * Extract the stock names into
       * an array for looping.
       */

      this.stocksList = Object.keys(this.stocks);

    });

  }

  /**
   * Get current timestamp.
   *
   * @returns a timestamp in milliseconds
   */
  private getTime() {

    const date = new Date();
    return date.getTime();

  }

  /**
   * Resets status of all stocks.
   */
  private resetState() {

    this.stocksList.forEach(name => {
      this.stocks[name]['status'] = 0;
    });

  }

}
