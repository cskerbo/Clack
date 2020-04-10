class UsersController < ApplicationController
  before_action :authenticate_user, only: [:find]
  def create
    user = User.new(user_params)
    if user.save!
      render json: user, status: 200
    else
      render json: user.errors, status: 422
    end
  end

  def find
    @user = User.find_by(email: params[:user][:email])
    if @user
      render json: @user
    else
      render json: @user.errors.full_messages
    end
  end

  def set_user
    @user = User.find_by(id: params[:id])
  end

  private

  def user_params
    params.require(:user).permit(:email, :password)
  end
end