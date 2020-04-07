class RoomsController < ApplicationController
  def index
    rooms = Room.all
    render json: rooms
  end

  def create
    room = Room.new(room_params)
    render json: room
  end

  def show
    room = Room.find(params[:id])
    render json :room, include: [:messages]
  end

  private

  def room_params
    params.require(:room).permit(:name)
  end
end